package com.geotube.service;

import com.geotube.dto.CityResult;
import com.geotube.dto.CountryResult;
import com.geotube.dto.VideoResult;
import com.geotube.model.Video;
import com.geotube.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);

    private final VideoRepository    videoRepository;
    private final YouTubeService     youTubeService;
    private final GeocodingService   geocodingService;

    public VideoService(VideoRepository videoRepository,
                        YouTubeService youTubeService,
                        GeocodingService geocodingService) {
        this.videoRepository  = videoRepository;
        this.youTubeService   = youTubeService;
        this.geocodingService = geocodingService;
    }

    public List<CountryResult> search(String query) {
        if (videoRepository.existsByQuery(query)) {
            log.info("Cache hit for query '{}'", query);
            return buildCountryResults(query);
        }

        log.info("Cache miss — fetching from YouTube for query '{}'", query);

        List<String> videoIds = youTubeService.searchVideoIds(query);
        if (videoIds.isEmpty()) return List.of();

        List<YouTubeService.RawVideoData> rawVideos = youTubeService.getVideoDetails(videoIds);
        if (rawVideos.isEmpty()) return List.of();

        log.info("Geocoding {} videos…", rawVideos.size());
        for (YouTubeService.RawVideoData raw : rawVideos) {
            String[] location = geocodingService.reverseGeocode(raw.latitude(), raw.longitude());

            Video video = new Video();
            video.setQuery(query);
            video.setVideoId(raw.videoId());
            video.setTitle(raw.title());
            video.setDescription(raw.description());
            video.setThumbnail(raw.thumbnail());
            video.setChannelId(raw.channelId());
            video.setLatitude(raw.latitude());
            video.setLongitude(raw.longitude());
            video.setCountry(location[0]);
            video.setCity(location[1]);
            video.setPublishedAt(raw.publishedAt());
            video.setCachedAt(LocalDateTime.now());

            videoRepository.save(video);
        }

        return buildCountryResults(query);
    }

    public List<CityResult> getCitiesByCountry(String country, String query) {
        List<Video> videos = videoRepository.findByQueryAndCountry(query, country);

        Map<String, List<Video>> byCity = videos.stream()
                .filter(v -> v.getCity() != null && !v.getCity().equals("Unknown"))
                .collect(Collectors.groupingBy(Video::getCity));

        return byCity.entrySet().stream()
                .map(e -> {
                    List<Video> cv = e.getValue();
                    double lat = cv.stream().mapToDouble(Video::getLatitude).average().orElse(0);
                    double lng = cv.stream().mapToDouble(Video::getLongitude).average().orElse(0);
                    return new CityResult(e.getKey(), country, lat, lng, cv.size());
                })
                .sorted(Comparator.comparingInt(CityResult::videoCount).reversed())
                .collect(Collectors.toList());
    }

    public List<VideoResult> getVideosByCity(String city, String query) {
        return videoRepository.findByQueryAndCity(query, city).stream()
                .map(v -> new VideoResult(
                        v.getVideoId(),
                        v.getTitle(),
                        v.getDescription(),
                        v.getThumbnail(),
                        v.getLatitude(),
                        v.getLongitude(),
                        v.getCountry(),
                        v.getCity(),
                        v.getPublishedAt()
                ))
                .collect(Collectors.toList());
    }

    private List<CountryResult> buildCountryResults(String query) {
        List<Video> videos = videoRepository.findByQuery(query);

        Map<String, List<Video>> byCountry = videos.stream()
                .filter(v -> v.getCountry() != null && !v.getCountry().equals("Unknown"))
                .collect(Collectors.groupingBy(Video::getCountry));

        return byCountry.entrySet().stream()
                .map(e -> {
                    List<Video> cv = e.getValue();
                    double lat = cv.stream().mapToDouble(Video::getLatitude).average().orElse(0);
                    double lng = cv.stream().mapToDouble(Video::getLongitude).average().orElse(0);
                    return new CountryResult(e.getKey(), lat, lng, cv.size());
                })
                .sorted(Comparator.comparingInt(CountryResult::videoCount).reversed())
                .collect(Collectors.toList());
    }
}
