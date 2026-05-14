package com.geotube.service;

import com.geotube.dto.CityResult;
import com.geotube.dto.CountryResult;
import com.geotube.dto.VideoResult;
import com.geotube.model.Video;
import com.geotube.repository.VideoRepository;
import com.geotube.service.CountryInferenceService.InferenceResult;
import com.geotube.util.CountryCoordinates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Core pipeline:
 *   1. Check MongoDB cache → return if hit
 *   2. Fetch up to 150 YouTube candidates (title + description + tags)
 *   3. Infer country for each video via CountryInferenceService
 *   4. If fewer than 2 countries found, expand query and retry
 *   5. Apply DiversificationService (max 10/country)
 *   6. Persist to MongoDB
 *   7. Return aggregated CountryResult list
 */
@Service
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);

    // Suffix templates used when the initial search lacks geographic diversity
    private static final List<String> EXPANSION_SUFFIXES = List.of(
            "around the world",
            "international",
            "travel",
            "street food worldwide",
            "global"
    );

    private final VideoRepository        videoRepository;
    private final YouTubeService         youTubeService;
    private final CountryInferenceService inferenceService;
    private final DiversificationService  diversificationService;

    public VideoService(VideoRepository videoRepository,
                        YouTubeService youTubeService,
                        CountryInferenceService inferenceService,
                        DiversificationService diversificationService) {
        this.videoRepository       = videoRepository;
        this.youTubeService        = youTubeService;
        this.inferenceService      = inferenceService;
        this.diversificationService = diversificationService;
    }

    // -----------------------------------------------------------------------
    // Search — primary entry point
    // -----------------------------------------------------------------------

    public List<CountryResult> search(String query) {
        if (videoRepository.existsByQuery(query)) {
            log.info("Cache hit for query '{}'", query);
            return buildCountryResults(videoRepository.findByQuery(query));
        }

        log.info("Cache miss — starting NLP pipeline for '{}'", query);

        List<Video> videos = fetchAndInfer(query);

        if (!diversificationService.hasSufficientDiversity(videos)) {
            log.info("Insufficient diversity ({} countries) — expanding query",
                    diversificationService.countDistinctCountries(videos));
            videos = expandQuery(query, videos);
        }

        List<Video> diversified = diversificationService.diversify(videos);
        log.info("Saving {} videos across {} countries for query '{}'",
                diversified.size(),
                diversificationService.countDistinctCountries(diversified),
                query);

        videoRepository.saveAll(diversified);
        return buildCountryResults(diversified);
    }

    // -----------------------------------------------------------------------
    // Country → cities drill-down
    // In the NLP system there is no per-city GPS data, so we surface the
    // country itself as a single navigable "city" entry.  The frontend can
    // still drill down and reach the video list via /api/city/{country}.
    // -----------------------------------------------------------------------

    public List<CityResult> getCitiesByCountry(String country, String query) {
        List<Video> videos = videoRepository.findByQueryAndCountry(query, country);
        if (videos.isEmpty()) return List.of();

        double[] coords = CountryCoordinates.get(country);
        return List.of(new CityResult(country, country, coords[0], coords[1], videos.size()));
    }

    // -----------------------------------------------------------------------
    // City → videos drill-down
    // "city" is the country name in the NLP system (echoed from getCitiesByCountry).
    // -----------------------------------------------------------------------

    public List<VideoResult> getVideosByCity(String city, String query) {
        // city == country name in new system
        List<Video> videos = videoRepository.findByQueryAndCountry(query, city);
        return videos.stream()
                .map(this::toVideoResult)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /** Fetches YouTube candidates and runs NLP inference on each one. */
    private List<Video> fetchAndInfer(String query) {
        List<YouTubeService.RawVideoData> rawVideos = youTubeService.searchVideos(query);
        List<Video> result = new ArrayList<>();

        for (YouTubeService.RawVideoData raw : rawVideos) {
            Video v = inferAndBuild(raw, query);
            if (v != null) result.add(v);
        }

        log.debug("Inferred country for {}/{} videos", result.size(), rawVideos.size());
        return result;
    }

    /**
     * Runs query expansion when the initial fetch has fewer than 2 countries.
     * Deduplicates by videoId and stops early once diversity is achieved.
     */
    private List<Video> expandQuery(String originalQuery, List<Video> existing) {
        Set<String> seenIds = existing.stream()
                .map(Video::getVideoId)
                .collect(Collectors.toCollection(HashSet::new));

        List<Video> all = new ArrayList<>(existing);

        for (String suffix : EXPANSION_SUFFIXES) {
            if (diversificationService.hasSufficientDiversity(all)) break;

            String expanded = originalQuery + " " + suffix;
            log.info("Expanding query → '{}'", expanded);

            for (YouTubeService.RawVideoData raw : youTubeService.searchVideos(expanded)) {
                if (seenIds.contains(raw.videoId())) continue;
                Video v = inferAndBuild(raw, originalQuery);
                if (v != null) {
                    all.add(v);
                    seenIds.add(raw.videoId());
                }
            }
        }

        return all;
    }

    /**
     * Runs country inference on a single raw video and builds the Video entity.
     * Returns null when no country can be inferred (confidence == 0).
     */
    private Video inferAndBuild(YouTubeService.RawVideoData raw, String query) {
        InferenceResult inference = inferenceService.infer(
                raw.title(), raw.description(), raw.tags());

        if (!inference.resolved()) return null;

        String country = CountryCoordinates.canonical(inference.country());
        double[] coords = CountryCoordinates.get(country);

        Video v = new Video();
        v.setQuery(query);
        v.setVideoId(raw.videoId());
        v.setTitle(raw.title());
        v.setDescription(raw.description());
        v.setThumbnail(raw.thumbnail());
        v.setChannelId(raw.channelId());
        v.setCountry(country);
        v.setCity(country);   // city == country in NLP system
        v.setLatitude(coords[0]);
        v.setLongitude(coords[1]);
        v.setInferenceSource(inference.source());
        v.setConfidence(inference.confidence());
        v.setPublishedAt(raw.publishedAt());
        v.setCachedAt(LocalDateTime.now());
        return v;
    }

    /** Aggregates a flat list of videos into per-country summary rows. */
    private List<CountryResult> buildCountryResults(List<Video> videos) {
        Map<String, List<Video>> byCountry = videos.stream()
                .filter(v -> v.getCountry() != null && !v.getCountry().isBlank())
                .collect(Collectors.groupingBy(Video::getCountry));

        return byCountry.entrySet().stream()
                .map(e -> {
                    double[] coords = CountryCoordinates.get(e.getKey());
                    return new CountryResult(e.getKey(), coords[0], coords[1], e.getValue().size());
                })
                .sorted(Comparator.comparingInt(CountryResult::videoCount).reversed())
                .collect(Collectors.toList());
    }

    /** Maps a Video entity to the VideoResult DTO expected by the frontend. */
    private VideoResult toVideoResult(Video v) {
        double[] coords = CountryCoordinates.get(v.getCountry());
        return new VideoResult(
                v.getVideoId(),
                v.getTitle(),
                v.getDescription(),
                v.getThumbnail(),
                coords[0],
                coords[1],
                v.getCountry(),
                v.getCountry(),   // city == country
                v.getPublishedAt()
        );
    }
}
