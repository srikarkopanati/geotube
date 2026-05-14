package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.geotube.dto.TrendingResponseDTO;
import com.geotube.model.TrendingData;
import com.geotube.repository.TrendingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Fetches and caches trending YouTube videos for 10 major regions.
 * Refreshes every 15 minutes via Spring's @Scheduled.
 */
@Service
public class TrendingService {

    private static final Logger log = LoggerFactory.getLogger(TrendingService.class);

    private static final Map<String, String>   REGION_NAMES;
    private static final Map<String, double[]> REGION_CENTROIDS;

    static {
        REGION_NAMES = Map.of(
            "IN", "India",
            "US", "United States",
            "JP", "Japan",
            "GB", "United Kingdom",
            "KR", "South Korea",
            "BR", "Brazil",
            "FR", "France",
            "DE", "Germany",
            "AU", "Australia",
            "CA", "Canada"
        );
        Map<String, double[]> coords = new LinkedHashMap<>();
        coords.put("IN", new double[]{ 20.5937,  78.9629});
        coords.put("US", new double[]{ 37.0902, -95.7129});
        coords.put("JP", new double[]{ 36.2048, 138.2529});
        coords.put("GB", new double[]{ 55.3781,  -3.4360});
        coords.put("KR", new double[]{ 35.9078, 127.7669});
        coords.put("BR", new double[]{-14.2350, -51.9253});
        coords.put("FR", new double[]{ 46.2276,   2.2137});
        coords.put("DE", new double[]{ 51.1657,  10.4515});
        coords.put("AU", new double[]{-25.2744, 133.7751});
        coords.put("CA", new double[]{ 56.1304,-106.3468});
        REGION_CENTROIDS = Collections.unmodifiableMap(coords);
    }

    @Value("${youtube.api.key}")
    private String apiKey;

    @Value("${youtube.base.url}")
    private String baseUrl;

    private final WebClient          webClient;
    private final TrendingRepository trendingRepository;

    public TrendingService(WebClient webClient, TrendingRepository trendingRepository) {
        this.webClient          = webClient;
        this.trendingRepository = trendingRepository;
    }

    @PostConstruct
    public void initOnStartup() {
        if (trendingRepository.count() == 0) {
            log.info("Trending cache empty — seeding initial data");
            try { refreshTrending(); }
            catch (Exception e) { log.warn("Initial trending seed failed: {}", e.getMessage()); }
        }
    }

    /** Refreshes trending data for all regions every 15 minutes. */
    @Scheduled(fixedRate = 900_000)
    public void refreshTrending() {
        log.info("Refreshing trending data for {} regions", REGION_CENTROIDS.size());
        for (String code : REGION_CENTROIDS.keySet()) {
            try {
                List<TrendingData.TrendingVideoData> videos = fetchTrendingVideos(code);
                saveTrendingData(code, videos);
            } catch (Exception e) {
                log.error("Trending refresh failed for region {}: {}", code, e.getMessage());
            }
        }
        log.info("Trending refresh complete");
    }

    public List<TrendingResponseDTO> getTrending() {
        List<TrendingData> all = trendingRepository.findAll();
        if (all.isEmpty()) {
            refreshTrending();
            all = trendingRepository.findAll();
        }
        return all.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private List<TrendingData.TrendingVideoData> fetchTrendingVideos(String regionCode) {
        try {
            JsonNode response = webClient.get()
                    .uri(baseUrl + "/videos", b -> b
                            .queryParam("part",       "snippet")
                            .queryParam("chart",      "mostPopular")
                            .queryParam("regionCode", regionCode)
                            .queryParam("maxResults", 10)
                            .queryParam("key",        apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            List<TrendingData.TrendingVideoData> videos = new ArrayList<>();
            if (response != null && response.has("items")) {
                for (JsonNode item : response.get("items")) {
                    TrendingData.TrendingVideoData v = new TrendingData.TrendingVideoData();
                    v.setVideoId(item.path("id").asText(""));
                    JsonNode snippet = item.path("snippet");
                    v.setTitle(snippet.path("title").asText(""));
                    v.setChannelId(snippet.path("channelId").asText(""));
                    v.setPublishedAt(snippet.path("publishedAt").asText(""));
                    String thumb = snippet.path("thumbnails").path("medium").path("url").asText("");
                    if (thumb.isBlank())
                        thumb = snippet.path("thumbnails").path("default").path("url").asText("");
                    v.setThumbnail(thumb);
                    if (!v.getVideoId().isBlank()) videos.add(v);
                }
            }
            log.debug("Fetched {} trending videos for {}", videos.size(), regionCode);
            return videos;
        } catch (Exception e) {
            log.error("YouTube trending fetch failed for {}: {}", regionCode, e.getMessage());
            return Collections.emptyList();
        }
    }

    private void saveTrendingData(String code, List<TrendingData.TrendingVideoData> topVideos) {
        double[] coords = REGION_CENTROIDS.get(code);
        String   name   = REGION_NAMES.get(code);

        TrendingData data = trendingRepository.findByRegionCode(code)
                                              .orElse(new TrendingData());
        data.setRegionCode(code);
        data.setRegionName(name);
        data.setLatitude(coords[0]);
        data.setLongitude(coords[1]);
        data.setTopVideos(topVideos);
        data.setVideoIds(topVideos.stream()
                .map(TrendingData.TrendingVideoData::getVideoId)
                .collect(Collectors.toList()));
        data.setUpdatedAt(LocalDateTime.now());
        trendingRepository.save(data);
    }

    private TrendingResponseDTO toDTO(TrendingData data) {
        List<Map<String, Object>> topVideos = Optional.ofNullable(data.getTopVideos())
                .orElse(Collections.emptyList())
                .stream()
                .map(v -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("videoId",     v.getVideoId());
                    m.put("title",       v.getTitle());
                    m.put("thumbnail",   v.getThumbnail());
                    m.put("channelId",   v.getChannelId());
                    m.put("publishedAt", v.getPublishedAt());
                    return m;
                })
                .collect(Collectors.toList());

        return new TrendingResponseDTO(
                data.getRegionName(),
                data.getLatitude(),
                data.getLongitude(),
                topVideos.size(),
                topVideos
        );
    }
}
