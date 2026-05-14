package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Fetches YouTube video candidates using a two-step approach:
 *   1. Search API  — collects up to (resultsPerPage × maxPages) video IDs
 *   2. Videos API  — fetches snippet (incl. tags) for those IDs in batches of 50
 *
 * No geolocation filtering — title / description / tags are enough for NLP inference.
 */
@Service
public class YouTubeService {

    private static final Logger log = LoggerFactory.getLogger(YouTubeService.class);

    @Value("${youtube.api.key}")
    private String apiKey;

    @Value("${youtube.base.url}")
    private String baseUrl;

    @Value("${youtube.search.results-per-page:50}")
    private int resultsPerPage;

    @Value("${youtube.search.max-pages:3}")
    private int maxPages;

    private final WebClient webClient;

    public YouTubeService(WebClient webClient) {
        this.webClient = webClient;
    }

    @PostConstruct
    public void logKeyStatus() {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR")) {
            log.error("!!!! YOUTUBE API KEY IS NOT SET — value: '{}' !!!!", apiKey);
        } else {
            log.info("YouTube API key loaded: {}...", apiKey.substring(0, Math.min(10, apiKey.length())));
        }
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Searches YouTube and returns up to (resultsPerPage × maxPages) videos
     * with full snippet metadata including tags.
     */
    public List<RawVideoData> searchVideos(String query) {
        log.info("Searching YouTube for '{}' (up to {} pages × {} results)",
                query, maxPages, resultsPerPage);

        List<String> videoIds = collectVideoIds(query);
        if (videoIds.isEmpty()) return Collections.emptyList();

        List<RawVideoData> results = fetchVideoDetails(videoIds);
        log.info("Retrieved {} videos with metadata for query '{}'", results.size(), query);
        return results;
    }

    // -----------------------------------------------------------------------
    // Step 1 — collect video IDs via Search API (multi-page)
    // -----------------------------------------------------------------------

    private List<String> collectVideoIds(String query) {
        List<String> ids = new ArrayList<>();
        String pageToken = null;

        for (int page = 0; page < maxPages; page++) {
            SearchPage sp = fetchSearchPage(query, pageToken);
            ids.addAll(sp.videoIds());
            pageToken = sp.nextPageToken();
            if (pageToken == null) break;
        }

        log.debug("Collected {} candidate video IDs for '{}'", ids.size(), query);
        return ids;
    }

    private SearchPage fetchSearchPage(String query, String pageToken) {
        try {
            final String token = pageToken;
            JsonNode response = webClient.get()
                    .uri(baseUrl + "/search", b -> {
                        b.queryParam("part",       "id")
                         .queryParam("type",       "video")
                         .queryParam("q",          query)
                         .queryParam("maxResults", resultsPerPage)
                         .queryParam("key",        apiKey);
                        if (token != null) b.queryParam("pageToken", token);
                        return b.build();
                    })
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, resp ->
                            resp.bodyToMono(String.class).map(body ->
                                    new RuntimeException("YouTube Search " + resp.statusCode() + ": " + body)))
                    .bodyToMono(JsonNode.class)
                    .block();

            List<String> ids = new ArrayList<>();
            String nextToken = null;

            if (response != null) {
                if (response.has("nextPageToken")) {
                    nextToken = response.get("nextPageToken").asText(null);
                }
                if (response.has("items")) {
                    for (JsonNode item : response.get("items")) {
                        String videoId = item.path("id").path("videoId").asText("");
                        if (!videoId.isBlank()) ids.add(videoId);
                    }
                }
            }

            return new SearchPage(ids, nextToken);

        } catch (WebClientResponseException e) {
            log.error("YouTube Search API error: {} — {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("YouTube search failed: " + e.getMessage(), e);
        }
    }

    // -----------------------------------------------------------------------
    // Step 2 — fetch snippet + tags via Videos API (batches of 50)
    // -----------------------------------------------------------------------

    private List<RawVideoData> fetchVideoDetails(List<String> videoIds) {
        List<RawVideoData> results = new ArrayList<>();

        for (int i = 0; i < videoIds.size(); i += 50) {
            List<String> batch = videoIds.subList(i, Math.min(i + 50, videoIds.size()));
            String ids = String.join(",", batch);

            try {
                JsonNode response = webClient.get()
                        .uri(baseUrl + "/videos", b -> b
                                .queryParam("part",       "snippet")
                                .queryParam("id",         ids)
                                .queryParam("key",        apiKey)
                                .build())
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();

                if (response != null && response.has("items")) {
                    for (JsonNode item : response.get("items")) {
                        RawVideoData data = parseVideoItem(item);
                        if (data != null) results.add(data);
                    }
                }

            } catch (WebClientResponseException e) {
                log.error("YouTube Videos API batch failed: {}", e.getMessage());
                // continue with other batches
            }
        }

        return results;
    }

    private RawVideoData parseVideoItem(JsonNode item) {
        String videoId = item.path("id").asText("");
        if (videoId.isBlank()) return null;

        JsonNode snippet = item.path("snippet");

        String title       = snippet.path("title").asText("Untitled");
        String description = snippet.path("description").asText("");
        String channelId   = snippet.path("channelId").asText("");
        String publishedAt = snippet.path("publishedAt").asText("");

        String thumbnail = snippet.path("thumbnails").path("medium").path("url").asText("");
        if (thumbnail.isBlank()) {
            thumbnail = snippet.path("thumbnails").path("default").path("url").asText("");
        }

        List<String> tags = new ArrayList<>();
        JsonNode tagsNode = snippet.path("tags");
        if (tagsNode.isArray()) {
            for (JsonNode t : tagsNode) {
                String tag = t.asText("");
                if (!tag.isBlank()) tags.add(tag);
            }
        }

        return new RawVideoData(videoId, title, description, thumbnail, channelId, tags, publishedAt);
    }

    // -----------------------------------------------------------------------
    // Data types
    // -----------------------------------------------------------------------

    public record RawVideoData(
            String       videoId,
            String       title,
            String       description,
            String       thumbnail,
            String       channelId,
            List<String> tags,
            String       publishedAt
    ) {}

    private record SearchPage(List<String> videoIds, String nextPageToken) {}
}
