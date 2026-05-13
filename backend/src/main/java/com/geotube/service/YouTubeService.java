package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;

@Service
public class YouTubeService {

    private static final Logger log = LoggerFactory.getLogger(YouTubeService.class);

    @Value("${youtube.api.key}")
    private String apiKey;

    @Value("${youtube.base.url}")
    private String baseUrl;

    @Value("${youtube.search.max-results:50}")
    private int maxResults;

    private final WebClient webClient;

    public YouTubeService(WebClient webClient) {
        this.webClient = webClient;
    }

    public List<String> searchVideoIds(String query) {
        log.info("Searching YouTube for: {}", query);
        try {
            JsonNode response = webClient.get()
                    .uri(baseUrl + "/search", b -> b
                            .queryParam("part", "snippet")
                            .queryParam("type", "video")
                            .queryParam("q", query)
                            .queryParam("maxResults", maxResults)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, resp ->
                            resp.bodyToMono(String.class).map(body ->
                                    new RuntimeException("YouTube Search API " + resp.statusCode() + ": " + body)))
                    .bodyToMono(JsonNode.class)
                    .block();

            List<String> ids = new ArrayList<>();
            if (response != null && response.has("items")) {
                for (JsonNode item : response.get("items")) {
                    String videoId = item.path("id").path("videoId").asText();
                    if (!videoId.isBlank()) ids.add(videoId);
                }
            }
            log.info("YouTube search returned {} video IDs", ids.size());
            return ids;

        } catch (WebClientResponseException e) {
            log.error("YouTube Search API failed: {} — {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("YouTube search failed: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches snippet + recordingDetails for a list of IDs (batches of 50).
     * Returns only items that have valid recordingDetails.location.
     */
    public List<RawVideoData> getVideoDetails(List<String> videoIds) {
        List<RawVideoData> results = new ArrayList<>();

        for (int i = 0; i < videoIds.size(); i += 50) {
            List<String> batch = videoIds.subList(i, Math.min(i + 50, videoIds.size()));
            String ids = String.join(",", batch);

            try {
                JsonNode response = webClient.get()
                        .uri(baseUrl + "/videos", b -> b
                                .queryParam("part", "snippet,recordingDetails")
                                .queryParam("id", ids)
                                .queryParam("key", apiKey)
                                .build())
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();

                if (response != null && response.has("items")) {
                    for (JsonNode item : response.get("items")) {
                        RawVideoData data = parseItem(item);
                        if (data != null) results.add(data);
                    }
                }
            } catch (WebClientResponseException e) {
                log.error("YouTube Videos API batch failed: {}", e.getMessage());
            }
        }

        log.info("Found {} videos with valid geolocation", results.size());
        return results;
    }

    private RawVideoData parseItem(JsonNode item) {
        JsonNode location = item.path("recordingDetails").path("location");
        if (location.isMissingNode()) return null;

        double lat = location.path("latitude").asDouble(Double.MAX_VALUE);
        double lng = location.path("longitude").asDouble(Double.MAX_VALUE);
        if (lat == Double.MAX_VALUE || lng == Double.MAX_VALUE) return null;
        if (lat == 0.0 && lng == 0.0) return null; // skip Null Island

        JsonNode snippet  = item.path("snippet");
        String  videoId   = item.path("id").asText("");
        if (videoId.isBlank()) return null;

        String title       = snippet.path("title").asText("Untitled");
        String description = snippet.path("description").asText("");
        String channelId   = snippet.path("channelId").asText("");
        String publishedAt = snippet.path("publishedAt").asText("");

        String thumbnail = snippet.path("thumbnails").path("medium").path("url").asText("");
        if (thumbnail.isBlank())
            thumbnail = snippet.path("thumbnails").path("default").path("url").asText("");

        return new RawVideoData(videoId, title, description, thumbnail, channelId, lat, lng, publishedAt);
    }

    public record RawVideoData(
            String videoId,
            String title,
            String description,
            String thumbnail,
            String channelId,
            double latitude,
            double longitude,
            String publishedAt
    ) {}
}
