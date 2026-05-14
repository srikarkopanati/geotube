package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Attempts to retrieve auto-generated captions for a YouTube video using the
 * unofficial timedtext endpoint.  Always fails gracefully — callers receive an
 * empty string rather than an exception when transcripts are unavailable.
 */
@Service
public class TranscriptService {

    private static final Logger log = LoggerFactory.getLogger(TranscriptService.class);

    /** Absolute character ceiling to keep downstream prompts manageable. */
    private static final int MAX_TRANSCRIPT_CHARS = 3000;

    private final WebClient  webClient;
    private final ObjectMapper objectMapper;

    public TranscriptService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient    = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Returns a plain-text transcript for the given videoId, or an empty string
     * if transcripts are unavailable or the request fails.
     */
    public String fetchTranscript(String videoId) {
        if (videoId == null || videoId.isBlank()) return "";

        // Try English captions first, then fall back to English (auto-generated)
        String text = tryFetch(videoId, "en");
        if (text.isBlank()) text = tryFetch(videoId, "en-US");
        if (text.isBlank()) text = tryFetchAuto(videoId);

        if (!text.isBlank()) {
            log.debug("Fetched transcript for video {} ({} chars)", videoId, text.length());
        }
        return text;
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private String tryFetch(String videoId, String lang) {
        try {
            String url = "https://www.youtube.com/api/timedtext?v=" + videoId
                         + "&lang=" + lang + "&fmt=json3";
            String body = webClient.get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(8))
                    .block();
            return parseJson3(body);
        } catch (Exception e) {
            return "";
        }
    }

    private String tryFetchAuto(String videoId) {
        try {
            // YouTube auto-generated captions often use asr (automatic speech recognition)
            String url = "https://www.youtube.com/api/timedtext?v=" + videoId
                         + "&lang=en&kind=asr&fmt=json3";
            String body = webClient.get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(8))
                    .block();
            return parseJson3(body);
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Parses a YouTube json3 transcript payload into plain text.
     * Format: { "events": [ { "segs": [ { "utf8": "..." } ] } ] }
     */
    private String parseJson3(String json) {
        if (json == null || json.isBlank()) return "";
        try {
            JsonNode root   = objectMapper.readTree(json);
            JsonNode events = root.path("events");
            if (!events.isArray()) return "";

            StringBuilder sb = new StringBuilder();
            for (JsonNode event : events) {
                JsonNode segs = event.path("segs");
                if (segs.isArray()) {
                    for (JsonNode seg : segs) {
                        String utf8 = seg.path("utf8").asText("");
                        if (!utf8.isBlank()) {
                            sb.append(utf8).append(' ');
                        }
                    }
                }
                if (sb.length() > MAX_TRANSCRIPT_CHARS) break;
            }
            return sb.toString().trim();
        } catch (Exception e) {
            return "";
        }
    }
}
