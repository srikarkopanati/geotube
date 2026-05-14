package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Aggregates per-video extractions into per-country summaries and generates
 * cross-country comparisons (similarities, differences, overview narratives).
 *
 * Uses Ollama (local) for narrative generation; falls back to Claude if
 * API key is configured; otherwise deterministic set-based comparison.
 */
@Service
public class ComparisonService {

    private static final Logger log = LoggerFactory.getLogger(ComparisonService.class);

    private final WebClient      webClient;
    private final ObjectMapper   objectMapper;
    private final OllamaService  ollamaService;

    public ComparisonService(WebClient webClient, ObjectMapper objectMapper, OllamaService ollamaService) {
        this.webClient     = webClient;
        this.objectMapper  = objectMapper;
        this.ollamaService = ollamaService;
    }

    /**
     * Produces the comparison section of the analysis dashboard.
     *
     * @param query              original search query
     * @param domain             classified domain
     * @param schema             schema template
     * @param countryExtractions map of country → list of per-video extraction maps
     * @return map with keys: countrySummaries, similarities, differences, overview
     */
    public Map<String, Object> compare(String query, String domain,
                                       Map<String, Object> schema,
                                       Map<String, List<Map<String, Object>>> countryExtractions) {

        // 1. Aggregate per country
        Map<String, Map<String, Object>> summaries = new LinkedHashMap<>();
        for (Map.Entry<String, List<Map<String, Object>>> e : countryExtractions.entrySet()) {
            summaries.put(e.getKey(), aggregateCountry(e.getValue(), schema));
        }

        // 2. Generate comparison narrative — Ollama if available, else rule-based fallback
        Map<String, Object> narrative;
        if (ollamaService.isAvailable()) {
            try {
                narrative = generateWithOllama(query, domain, summaries);
            } catch (Exception ex) {
                log.warn("Ollama comparison failed, using rule-based fallback: {}", ex.getMessage());
                narrative = generateRuleBased(summaries, schema);
            }
        } else {
            narrative = generateRuleBased(summaries, schema);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("countrySummaries", summaries);
        result.putAll(narrative);
        return result;
    }

    // ── Aggregation ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> aggregateCountry(List<Map<String, Object>> extractions,
                                                  Map<String, Object> schema) {
        Map<String, Object> agg = new LinkedHashMap<>();

        for (String key : schema.keySet()) {
            Object def = schema.get(key);
            if (def instanceof List) {
                // Merge all lists, deduplicate, cap at 8 items
                Set<String> merged = new HashSet<>();
                for (Map<String, Object> ex : extractions) {
                    Object val = ex.get(key);
                    if (val instanceof List) {
                        for (Object item : (List<?>) val) {
                            if (item != null && !item.toString().isBlank()) {
                                merged.add(item.toString());
                            }
                        }
                    }
                }
                agg.put(key, new ArrayList<>(merged).subList(0, Math.min(8, merged.size())));
            } else {
                // For string fields pick the most common non-empty value
                Map<String, Long> freq = new HashMap<>();
                for (Map<String, Object> ex : extractions) {
                    Object val = ex.get(key);
                    if (val != null && !val.toString().isBlank()) {
                        freq.merge(val.toString(), 1L, Long::sum);
                    }
                }
                String best = freq.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("");
                agg.put(key, best);
            }
        }
        return agg;
    }

    // ── Ollama narrative generation ───────────────────────────────────────

    private Map<String, Object> generateWithOllama(String query, String domain,
                                                    Map<String, Map<String, Object>> summaries) throws Exception {
        String summaryJson = objectMapper.writeValueAsString(summaries);
        String prompt = String.format("""
                You are a cultural analyst comparing how different countries approach "%s" (%s domain).

                Country summaries (aggregated from video analysis):
                %s

                Generate a JSON response with exactly these three keys:
                {
                  "overview": ["one sentence per country describing its unique approach"],
                  "similarities": ["bullet point of shared trait"],
                  "differences": ["bullet point of contrasting trait between countries"]
                }

                Rules:
                - overview: one item per country (mention country name)
                - similarities: 3-5 items of common ground across ALL countries
                - differences: 4-6 items of notable contrasts (mention country names)
                - Be specific and insightful, not generic
                - Return ONLY valid JSON, no markdown, no explanation
                """, query, domain, summaryJson);

        String responseText = ollamaService.generate(prompt);
        String cleaned = responseText.replaceAll("(?s)```(?:json)?\\s*", "").replaceAll("```", "").trim();
        JsonNode parsed = objectMapper.readTree(cleaned);
        return objectMapper.convertValue(parsed, Map.class);
    }

    // ── Rule-based comparison ─────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> generateRuleBased(Map<String, Map<String, Object>> summaries,
                                                   Map<String, Object> schema) {
        List<String> overview      = new ArrayList<>();
        List<String> similarities  = new ArrayList<>();
        List<String> differences   = new ArrayList<>();

        // Overview: one sentence per country
        for (Map.Entry<String, Map<String, Object>> e : summaries.entrySet()) {
            String country = e.getKey();
            Map<String, Object> s = e.getValue();
            String desc = buildCountryDesc(country, s);
            overview.add(desc);
        }

        // Similarities: find list values common to ALL countries
        for (String key : schema.keySet()) {
            if (!(schema.get(key) instanceof List)) continue;
            Set<String> common = null;
            for (Map<String, Object> s : summaries.values()) {
                Object v = s.get(key);
                Set<String> items = v instanceof List
                    ? ((List<?>) v).stream().map(Object::toString).collect(Collectors.toSet())
                    : new HashSet<>();
                common = (common == null) ? new HashSet<>(items) : intersect(common, items);
            }
            if (common != null && !common.isEmpty()) {
                String label = capitalize(key.replace('_', ' '));
                similarities.add(label + ": " + String.join(", ", common));
            }
        }
        if (similarities.isEmpty()) {
            similarities.add("All countries share interest in " + guessTopicFromSummaries(summaries));
        }

        // Differences: find list values unique to each country
        for (Map.Entry<String, Map<String, Object>> e : summaries.entrySet()) {
            String country = e.getKey();
            for (String key : schema.keySet()) {
                if (!(schema.get(key) instanceof List)) continue;
                Object v = e.getValue().get(key);
                if (!(v instanceof List)) continue;
                Set<String> mine = ((List<?>) v).stream().map(Object::toString).collect(Collectors.toSet());
                // Remove items found in other countries
                for (Map.Entry<String, Map<String, Object>> other : summaries.entrySet()) {
                    if (other.getKey().equals(country)) continue;
                    Object ov = other.getValue().get(key);
                    if (ov instanceof List) {
                        mine.removeAll(((List<?>) ov).stream().map(Object::toString).collect(Collectors.toSet()));
                    }
                }
                if (!mine.isEmpty()) {
                    String label = capitalize(key.replace('_', ' '));
                    differences.add(country + " — unique " + label + ": " + String.join(", ", mine));
                    break; // one difference per country to keep concise
                }
            }
        }
        if (differences.isEmpty()) {
            for (String country : summaries.keySet()) {
                differences.add(country + " has a distinct regional approach");
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overview",     overview);
        result.put("similarities", similarities);
        result.put("differences",  differences);
        return result;
    }

    // ── Micro-helpers ─────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String buildCountryDesc(String country, Map<String, Object> summary) {
        // Pick first non-empty list field and first non-empty string field
        List<String> highlights = new ArrayList<>();
        String style = "";
        for (Map.Entry<String, Object> e : summary.entrySet()) {
            if (e.getValue() instanceof List && !((List<?>) e.getValue()).isEmpty()) {
                List<?> list = (List<?>) e.getValue();
                highlights.add(capitalize(e.getKey().replace('_', ' ')) + ": "
                               + list.stream().limit(2).map(Object::toString).collect(Collectors.joining(", ")));
            } else if (e.getValue() instanceof String && !((String) e.getValue()).isBlank()) {
                style = e.getValue().toString();
            }
            if (highlights.size() >= 2) break;
        }
        if (highlights.isEmpty()) return country + " shows a distinctive local approach.";
        return country + " — " + String.join("; ", highlights)
               + (style.isBlank() ? "." : " (" + style + ").");
    }

    private Set<String> intersect(Set<String> a, Set<String> b) {
        Set<String> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }

    private String guessTopicFromSummaries(Map<String, Map<String, Object>> summaries) {
        for (Map<String, Object> s : summaries.values()) {
            for (Map.Entry<String, Object> e : s.entrySet()) {
                if (e.getValue() instanceof List && !((List<?>) e.getValue()).isEmpty()) {
                    return capitalize(e.getKey().replace('_', ' '));
                }
            }
        }
        return "the topic";
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
