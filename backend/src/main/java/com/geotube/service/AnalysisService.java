package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.geotube.dto.ChatRequest;
import com.geotube.model.ComparisonCache;
import com.geotube.model.Video;
import com.geotube.model.VideoAnalysis;
import com.geotube.repository.ComparisonCacheRepository;
import com.geotube.repository.VideoAnalysisRepository;
import com.geotube.repository.VideoRepository;
import com.geotube.util.CountryCoordinates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Orchestrates the full Comparative Analysis pipeline:
 *   1. Cache check (comparison_cache)
 *   2. Query classification + schema selection
 *   3. Top-K video fetch per country
 *   4. Transcript fetch + per-video attribute extraction (with video-level caching)
 *   5. Country-level aggregation + cross-country comparison
 *   6. Result caching + return
 *
 * Also handles the Ask AI chat endpoint.
 */
@Service
public class AnalysisService {

    private static final Logger log   = LoggerFactory.getLogger(AnalysisService.class);
    private static final int    TOP_K = 5;

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com}")
    private String anthropicApiUrl;

    private final VideoRepository         videoRepository;
    private final VideoAnalysisRepository videoAnalysisRepository;
    private final ComparisonCacheRepository comparisonCacheRepository;
    private final QueryClassifierService  classifierService;
    private final SchemaService           schemaService;
    private final TranscriptService       transcriptService;
    private final ExtractionService       extractionService;
    private final ComparisonService       comparisonService;
    private final WebClient               webClient;
    private final ObjectMapper            objectMapper;

    public AnalysisService(VideoRepository videoRepository,
                           VideoAnalysisRepository videoAnalysisRepository,
                           ComparisonCacheRepository comparisonCacheRepository,
                           QueryClassifierService classifierService,
                           SchemaService schemaService,
                           TranscriptService transcriptService,
                           ExtractionService extractionService,
                           ComparisonService comparisonService,
                           WebClient webClient,
                           ObjectMapper objectMapper) {
        this.videoRepository          = videoRepository;
        this.videoAnalysisRepository  = videoAnalysisRepository;
        this.comparisonCacheRepository = comparisonCacheRepository;
        this.classifierService        = classifierService;
        this.schemaService            = schemaService;
        this.transcriptService        = transcriptService;
        this.extractionService        = extractionService;
        this.comparisonService        = comparisonService;
        this.webClient                = webClient;
        this.objectMapper             = objectMapper;
    }

    // ── Public API ────────────────────────────────────────────────────────

    public Map<String, Object> analyze(String query, List<String> countries) {
        List<String> sorted   = countries.stream().sorted().collect(Collectors.toList());
        String       cacheKey = buildCacheKey(query, sorted);

        // 1. Check comparison cache
        Optional<ComparisonCache> hit = comparisonCacheRepository.findByCacheKey(cacheKey);
        if (hit.isPresent()) {
            log.info("Comparison cache hit for key '{}'", cacheKey);
            return hit.get().getDashboard();
        }

        log.info("Starting comparative analysis — query='{}', countries={}", query, countries);

        // 2. Classify + schema
        String             domain = classifierService.classify(query);
        Map<String, Object> schema = schemaService.getSchema(domain);
        log.info("Domain classified as '{}' with {} schema fields", domain, schema.size());

        // 3-4. Per-country extraction
        Map<String, List<Map<String, Object>>> countryExtractions = new LinkedHashMap<>();
        List<Map<String, Object>>              countryData         = new ArrayList<>();

        for (String country : countries) {
            List<Video>                 videos       = videoRepository.findByQueryAndCountry(query, country);
            List<Video>                 topK         = videos.stream().limit(TOP_K).collect(Collectors.toList());
            List<Map<String, Object>>   extractions  = new ArrayList<>();
            List<Map<String, Object>>   videoSummaries = new ArrayList<>();

            log.info("Processing {} videos for country '{}'", topK.size(), country);

            for (Video video : topK) {
                Map<String, Object> attrs = getOrExtract(query, country, video, domain, schema);
                extractions.add(attrs);

                Map<String, Object> vs = new LinkedHashMap<>();
                vs.put("videoId",   video.getVideoId());
                vs.put("title",     video.getTitle());
                vs.put("thumbnail", video.getThumbnail());
                vs.put("attributes", attrs);
                videoSummaries.add(vs);
            }

            countryExtractions.put(country, extractions);

            double[] coords = CountryCoordinates.get(country);
            Map<String, Object> cd = new LinkedHashMap<>();
            cd.put("country",    country);
            cd.put("latitude",   coords[0]);
            cd.put("longitude",  coords[1]);
            cd.put("videoCount", topK.size());
            cd.put("videos",     videoSummaries);
            countryData.add(cd);
        }

        // 5. Compare
        Map<String, Object> comparison = comparisonService.compare(query, domain, schema, countryExtractions);

        // 6. Merge country summaries into countryData
        Map<String, Map<String, Object>> summaries =
            (Map<String, Map<String, Object>>) comparison.remove("countrySummaries");
        if (summaries != null) {
            for (Map<String, Object> cd : countryData) {
                String c = (String) cd.get("country");
                cd.put("summary", summaries.getOrDefault(c, Map.of()));
            }
        }

        // 7. Build dashboard
        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("query",      query);
        dashboard.put("domain",     domain);
        dashboard.put("countries",  countryData);
        dashboard.put("comparison", comparison);

        // 8. Cache
        ComparisonCache entry = new ComparisonCache();
        entry.setQuery(query);
        entry.setCountries(sorted);
        entry.setCacheKey(cacheKey);
        entry.setDashboard(dashboard);
        entry.setCachedAt(LocalDateTime.now());
        try {
            comparisonCacheRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to cache comparison result: {}", e.getMessage());
        }

        return dashboard;
    }

    public Map<String, Object> chat(ChatRequest request) {
        if (!isClaudeAvailable()) {
            return Map.of("answer",
                "AI chat requires an Anthropic API key. " +
                "Set ANTHROPIC_API_KEY in the backend .env file to enable this feature.");
        }

        try {
            String contextSummary = buildContextSummary(request);
            String prompt = String.format("""
                    You are a cultural analyst helping users understand comparisons between countries.

                    Analysis context:
                    Query: %s
                    Countries: %s
                    %s

                    User question: %s

                    Provide a clear, insightful, concise answer (2-4 sentences).
                    Focus on cultural and regional nuances. Be specific about countries.
                    """,
                    request.getQuery(),
                    String.join(", ", request.getCountries()),
                    contextSummary,
                    request.getQuestion());

            Map<String, Object> body = Map.of(
                "model",      "claude-sonnet-4-6",
                "max_tokens", 512,
                "messages",   List.of(Map.of("role", "user", "content", prompt))
            );

            String resp = webClient.post()
                    .uri(anthropicApiUrl + "/v1/messages")
                    .header("x-api-key",        anthropicApiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            JsonNode root   = objectMapper.readTree(resp);
            String   answer = root.path("content").get(0).path("text").asText();
            return Map.of("answer", answer);

        } catch (Exception e) {
            log.error("Chat request failed: {}", e.getMessage(), e);
            return Map.of("answer", "Sorry, I couldn't process your question right now. Please try again.");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private Map<String, Object> getOrExtract(String query, String country, Video video,
                                              String domain, Map<String, Object> schema) {
        Optional<VideoAnalysis> cached =
            videoAnalysisRepository.findByQueryAndCountryAndVideoId(query, country, video.getVideoId());

        if (cached.isPresent()) {
            log.debug("Video analysis cache hit: {} / {}", country, video.getVideoId());
            return cached.get().getAttributes();
        }

        String transcript = transcriptService.fetchTranscript(video.getVideoId());
        Map<String, Object> attrs = extractionService.extract(
            query, domain, schema, transcript, video.getTitle(), video.getDescription());

        VideoAnalysis va = new VideoAnalysis();
        va.setQuery(query);
        va.setCountry(country);
        va.setVideoId(video.getVideoId());
        va.setDomain(domain);
        va.setSchemaType(domain);
        va.setAttributes(attrs);
        va.setCachedAt(LocalDateTime.now());
        try {
            videoAnalysisRepository.save(va);
        } catch (Exception e) {
            log.warn("Failed to cache video analysis for {}/{}: {}", country, video.getVideoId(), e.getMessage());
        }

        return attrs;
    }

    private String buildCacheKey(String query, List<String> sortedCountries) {
        return query.trim().toLowerCase() + "|" + String.join(",", sortedCountries);
    }

    private boolean isClaudeAvailable() {
        return anthropicApiKey != null && !anthropicApiKey.isBlank();
    }

    @SuppressWarnings("unchecked")
    private String buildContextSummary(ChatRequest request) {
        if (request.getAnalysisContext() == null) return "";
        try {
            Map<String, Object> ctx = (Map<String, Object>) request.getAnalysisContext();
            Object comparison = ctx.get("comparison");
            if (comparison != null) {
                return "Comparison data: " + objectMapper.writeValueAsString(comparison);
            }
        } catch (Exception ignored) {}
        return "";
    }
}
