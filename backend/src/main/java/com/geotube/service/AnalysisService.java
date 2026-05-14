package com.geotube.service;

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
import org.springframework.stereotype.Service;

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

    private final VideoRepository            videoRepository;
    private final VideoAnalysisRepository    videoAnalysisRepository;
    private final ComparisonCacheRepository  comparisonCacheRepository;
    private final QueryClassifierService     classifierService;
    private final SchemaService              schemaService;
    private final TranscriptService          transcriptService;
    private final ExtractionService          extractionService;
    private final ComparisonService          comparisonService;
    private final OllamaService              ollamaService;
    private final VisualizationDataService   vizService;
    private final ObjectMapper               objectMapper;

    public AnalysisService(VideoRepository videoRepository,
                           VideoAnalysisRepository videoAnalysisRepository,
                           ComparisonCacheRepository comparisonCacheRepository,
                           QueryClassifierService classifierService,
                           SchemaService schemaService,
                           TranscriptService transcriptService,
                           ExtractionService extractionService,
                           ComparisonService comparisonService,
                           OllamaService ollamaService,
                           VisualizationDataService vizService,
                           ObjectMapper objectMapper) {
        this.videoRepository          = videoRepository;
        this.videoAnalysisRepository  = videoAnalysisRepository;
        this.comparisonCacheRepository = comparisonCacheRepository;
        this.classifierService        = classifierService;
        this.schemaService            = schemaService;
        this.transcriptService        = transcriptService;
        this.extractionService        = extractionService;
        this.comparisonService        = comparisonService;
        this.ollamaService            = ollamaService;
        this.vizService               = vizService;
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
                vs.put("videoId",     video.getVideoId());
                vs.put("title",       video.getTitle());
                vs.put("thumbnail",   video.getThumbnail());
                vs.put("publishedAt", video.getPublishedAt());
                vs.put("attributes",  attrs);
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

        // 7b. Append visualization-ready payload (non-blocking enrichment)
        try {
            dashboard.put("vizData", vizService.buildAll(dashboard));
        } catch (Exception e) {
            log.warn("Visualization data build failed (non-fatal): {}", e.getMessage());
        }

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
        String contextSummary = buildContextSummary(request);
        String prompt = String.format("""
                You are a cultural analyst helping users understand comparisons between countries.

                Analysis context:
                Query: %s
                Countries: %s
                %s

                User question: %s

                Instructions:
                - Provide a clear, insightful, concise answer (2-4 sentences).
                - Focus on cultural and regional nuances. Be specific about countries.
                - Do not include any thinking or reasoning tags in your response.

                LANGUAGE RULE — follow this exactly:
                First, determine the language of the user question:
                - If the question is written in plain English → answer ONLY in plain English. Do NOT use any Telugu words.
                - If the question is written in Telugu script (అ, ఆ, ఇ, ఈ... characters) → answer in Telugu script.
                - If the question is Tenglish (Telugu words written in English letters, e.g. "enti", "untundi", "chala", "ekkuva", "bagundi", "yevari", "aithe", "kooda", "untayi", "chestaru") → answer in Tenglish.

                To detect Tenglish, look for Telugu-specific words as WHOLE WORDS (not substrings):
                "enti", "untundi", "chala", "ekkuva", "bagundi", "yevari", "aithe", "kooda",
                "untayi", "chestaru", "takkuva", "anni", "rendu", "matram", "ledu", "kaadu"
                At least 2 of these must appear as standalone words for it to count as Tenglish.

                Tenglish grammar — use these exact patterns:
                - "X lo" = in X            → "India lo", "Japan lo"
                - "chala" = very           → "chala bagundi", "chala ekkuva"
                - "ekkuva" = more          → "variety ekkuva untundi"
                - "takkuva" = less         → "cost takkuva untundi"
                - "untundi" = there is     → "fresh food untundi"
                - "untayi" = there are     → "chala options untayi"
                - "chestaru" = they do     → "spices use chestaru"
                - "aithe" = whereas/but    → "India lo spicy, Japan lo aithe mild"
                - "kooda" = also/too       → "Italy lo kooda similar"

                Tenglish examples:
                Q: "ee rendu countries lo common ga enti?"
                A: "Rendu countries lo kooda semolina-based dishes chala popular ga untayi. Spices use kooda rendu lo similar ga untundi."

                Q: "yevari breakfast lo ekkuva variety untundi?"
                A: "India lo breakfast variety chala ekkuva untundi — idli, dosa, upma anni options untayi. Japan lo aithe simple ga rice tho miso soup matrame untundi."

                English example:
                Q: "Which country has more variety?"
                A: "India has significantly more breakfast variety with dishes like idli, dosa, and paratha. Japan tends to keep breakfast simple with rice and miso soup."

                IMPORTANT: Answer must be based ONLY on the extracted data above. Do not invent ingredients or facts.
                """,
                request.getQuery(),
                String.join(", ", request.getCountries()),
                contextSummary,
                request.getQuestion());

        if (ollamaService.isAvailable()) {
            try {
                String answer = ollamaService.generate(prompt);
                return Map.of("answer", answer.trim());
            } catch (Exception e) {
                log.error("Ollama chat request failed: {}", e.getMessage(), e);
            }
        }

        return Map.of("answer", "AI chat requires Ollama running locally (http://localhost:11434).");
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

    @SuppressWarnings("unchecked")
    private String buildContextSummary(ChatRequest request) {
        if (request.getAnalysisContext() == null) return "";
        try {
            Map<String, Object> ctx = (Map<String, Object>) request.getAnalysisContext();
            StringBuilder sb = new StringBuilder();

            // 1. Per-country extracted attributes — the real data the model must use
            List<Map<String, Object>> countries = (List<Map<String, Object>>) ctx.get("countries");
            if (countries != null) {
                sb.append("Extracted data per country (USE ONLY THIS — do not invent facts):\n");
                for (Map<String, Object> c : countries) {
                    String name = (String) c.get("country");
                    Map<String, Object> summary = (Map<String, Object>) c.get("summary");
                    if (summary == null) continue;
                    sb.append("  ").append(name).append(": ");
                    summary.forEach((k, v) -> {
                        if (v instanceof List<?> list && !list.isEmpty()) {
                            sb.append(k).append("=[")
                              .append(list.stream().limit(4).map(Object::toString).collect(java.util.stream.Collectors.joining(", ")))
                              .append("] ");
                        } else if (v instanceof String s && !s.isBlank()) {
                            sb.append(k).append("=").append(s).append(" ");
                        }
                    });
                    sb.append("\n");
                }
            }

            // 2. Concise narrative for similarities / differences
            Map<String, Object> comparison = (Map<String, Object>) ctx.get("comparison");
            if (comparison != null) {
                Object sims = comparison.get("similarities");
                if (sims instanceof List<?> list && !list.isEmpty()) {
                    sb.append("Similarities: ").append(list.stream().limit(2).map(Object::toString).collect(java.util.stream.Collectors.joining("; "))).append("\n");
                }
                Object diffs = comparison.get("differences");
                if (diffs instanceof List<?> list && !list.isEmpty()) {
                    sb.append("Differences: ").append(list.stream().limit(2).map(Object::toString).collect(java.util.stream.Collectors.joining("; "))).append("\n");
                }
            }

            return sb.toString();
        } catch (Exception ignored) {}
        return "";
    }
}
