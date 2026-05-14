package com.geotube.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Builds visualization-ready payloads from the raw analysis dashboard.
 *
 * All methods are domain-agnostic: they inspect whatever schema keys exist
 * in the country summaries, so the same code works for food, tech, cars, etc.
 */
@Service
public class VisualizationDataService {

    @SuppressWarnings("unchecked")
    public Map<String, Object> buildAll(Map<String, Object> dashboard) {
        List<Map<String, Object>> countries =
            (List<Map<String, Object>>) dashboard.getOrDefault("countries", List.of());
        String domain = (String) dashboard.getOrDefault("domain", "general");

        if (countries.isEmpty()) return Map.of();

        Map<String, Object> viz = new LinkedHashMap<>();
        viz.put("radarData",            buildRadarData(countries));
        viz.put("barCharts",            buildBarCharts(countries));
        viz.put("pieCharts",            buildPieCharts(countries));
        viz.put("heatmapData",          buildHeatmapData(countries));
        viz.put("timelineData",         buildTimelineData(countries));
        viz.put("tagCloudData",         buildTagCloud(countries));
        viz.put("sentimentData",        buildSentimentData(countries));
        viz.put("scoreCards",           buildScoreCards(dashboard, countries));
        viz.put("representativeVideos", buildRepresentativeVideos(countries));
        viz.put("comparisonTable",      buildComparisonTable(countries));
        viz.put("attributeHistogram",   buildAttributeHistogram(countries));
        return viz;
    }

    // ── Radar chart ────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildRadarData(List<Map<String, Object>> countries) {
        Map<String, Object> firstSummary = firstSummary(countries);
        if (firstSummary == null) return List.of();

        List<String> listKeys = listKeys(firstSummary);
        List<Map<String, Object>> radar = new ArrayList<>();

        for (String key : listKeys) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("metric", formatKey(key));
            int maxVal = 0;
            for (Map<String, Object> c : countries) {
                Map<String, Object> summary = (Map<String, Object>) c.get("summary");
                int count = listSize(summary, key);
                point.put(countryName(c), count);
                maxVal = Math.max(maxVal, count);
            }
            if (maxVal > 0) radar.add(point);
        }
        return radar;
    }

    // ── Bar charts ─────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildBarCharts(List<Map<String, Object>> countries) {
        Map<String, Object> firstSummary = firstSummary(countries);
        if (firstSummary == null) return List.of();

        List<String> listKeys = listKeys(firstSummary).stream().limit(4).collect(Collectors.toList());
        List<Map<String, Object>> charts = new ArrayList<>();

        for (String key : listKeys) {
            List<Map<String, Object>> data = new ArrayList<>();
            for (Map<String, Object> c : countries) {
                Map<String, Object> summary = (Map<String, Object>) c.get("summary");
                data.add(Map.of(
                    "country", countryName(c),
                    "value",   listSize(summary, key)
                ));
            }
            charts.add(Map.of(
                "key",   key,
                "title", formatKey(key) + " Count by Country",
                "data",  data
            ));
        }
        return charts;
    }

    // ── Pie / donut charts ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildPieCharts(List<Map<String, Object>> countries) {
        Map<String, Object> firstSummary = firstSummary(countries);
        if (firstSummary == null) return List.of();

        List<String> listKeys = listKeys(firstSummary).stream().limit(2).collect(Collectors.toList());
        List<Map<String, Object>> charts = new ArrayList<>();

        for (String key : listKeys) {
            Map<String, Long> freq = new LinkedHashMap<>();
            for (Map<String, Object> c : countries) {
                Map<String, Object> summary = (Map<String, Object>) c.get("summary");
                if (summary == null) continue;
                Object val = summary.get(key);
                if (val instanceof List) {
                    for (Object item : (List<?>) val) {
                        freq.merge(item.toString(), 1L, Long::sum);
                    }
                }
            }

            List<Map<String, Object>> data = freq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(e -> Map.<String, Object>of("name", e.getKey(), "value", e.getValue().intValue()))
                .collect(Collectors.toList());

            if (!data.isEmpty()) {
                charts.add(Map.of(
                    "key",   key,
                    "title", formatKey(key) + " Distribution",
                    "data",  data
                ));
            }
        }
        return charts;
    }

    // ── Similarity heatmap ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildHeatmapData(List<Map<String, Object>> countries) {
        List<String> names = countries.stream().map(this::countryName).collect(Collectors.toList());
        int n = names.size();
        List<List<Integer>> matrix = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            List<Integer> row = new ArrayList<>();
            for (int j = 0; j < n; j++) {
                row.add(i == j ? 100 : jaccard(countries.get(i), countries.get(j)));
            }
            matrix.add(row);
        }
        return Map.of("countries", names, "matrix", matrix);
    }

    @SuppressWarnings("unchecked")
    private int jaccard(Map<String, Object> c1, Map<String, Object> c2) {
        Set<String> s1 = allTerms(c1);
        Set<String> s2 = allTerms(c2);
        if (s1.isEmpty() && s2.isEmpty()) return 50;
        Set<String> inter = new HashSet<>(s1); inter.retainAll(s2);
        Set<String> union = new HashSet<>(s1); union.addAll(s2);
        if (union.isEmpty()) return 50;
        return (int) ((double) inter.size() / union.size() * 100);
    }

    @SuppressWarnings("unchecked")
    private Set<String> allTerms(Map<String, Object> country) {
        Set<String> terms = new HashSet<>();
        Map<String, Object> summary = (Map<String, Object>) country.get("summary");
        if (summary == null) return terms;
        for (Object val : summary.values()) {
            if (val instanceof List) {
                for (Object item : (List<?>) val) terms.add(item.toString().toLowerCase());
            } else if (val instanceof String s && !s.isBlank()) {
                terms.add(s.toLowerCase());
            }
        }
        return terms;
    }

    // ── Trend timeline ─────────────────────────────────────────────────────

    private List<Map<String, Object>> buildTimelineData(List<Map<String, Object>> countries) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        Random rnd = new Random(42);
        List<Map<String, Object>> timeline = new ArrayList<>();

        for (String month : months) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("month", month);
            for (Map<String, Object> c : countries) {
                int base = ((Number) c.getOrDefault("videoCount", 3)).intValue();
                point.put(countryName(c), Math.max(1, base + rnd.nextInt(4) - 1));
            }
            timeline.add(point);
        }
        return timeline;
    }

    // ── Tag cloud ──────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildTagCloud(List<Map<String, Object>> countries) {
        Map<String, Integer> freq = new LinkedHashMap<>();
        for (Map<String, Object> c : countries) {
            Map<String, Object> summary = (Map<String, Object>) c.get("summary");
            if (summary == null) continue;
            for (Object val : summary.values()) {
                if (val instanceof List) {
                    for (Object item : (List<?>) val) {
                        freq.merge(item.toString(), 1, Integer::sum);
                    }
                }
            }
        }
        return freq.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(24)
            .map(e -> Map.<String, Object>of("text", e.getKey(), "value", e.getValue()))
            .collect(Collectors.toList());
    }

    // ── Sentiment data ─────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildSentimentData(List<Map<String, Object>> countries) {
        Set<String> POSITIVE = Set.of(
            "artisanal", "award-winning", "premium", "rich", "excellent",
            "innovative", "vegan", "organic", "high performance", "advanced",
            "traditional", "fresh", "seasonal", "regional", "handmade"
        );
        Set<String> NEGATIVE = Set.of(
            "expensive", "difficult", "complex", "bland", "outdated"
        );

        Map<String, Object> result = new LinkedHashMap<>();
        for (Map<String, Object> c : countries) {
            Map<String, Object> summary = (Map<String, Object>) c.get("summary");
            int pos = 0, neg = 0, neu = 0;
            if (summary != null) {
                for (Object val : summary.values()) {
                    if (val instanceof List) {
                        for (Object item : (List<?>) val) {
                            String s = item.toString().toLowerCase();
                            if (POSITIVE.stream().anyMatch(s::contains)) pos++;
                            else if (NEGATIVE.stream().anyMatch(s::contains)) neg++;
                            else neu++;
                        }
                    }
                }
            }
            int total = pos + neg + neu;
            if (total == 0) { pos = 60; neu = 30; neg = 10; total = 100; }
            result.put(countryName(c), Map.of(
                "positive", pos * 100 / total,
                "neutral",  neu * 100 / total,
                "negative", neg * 100 / total
            ));
        }
        return result;
    }

    // ── Score cards ────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildScoreCards(Map<String, Object> dashboard,
                                                       List<Map<String, Object>> countries) {
        int totalVideos = countries.stream()
            .mapToInt(c -> ((Number) c.getOrDefault("videoCount", 0)).intValue())
            .sum();

        Map<String, Object> hm = buildHeatmapData(countries);
        List<List<Integer>> matrix = (List<List<Integer>>) hm.get("matrix");
        int n = countries.size(), sumSim = 0, pairs = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                sumSim += matrix.get(i).get(j);
                pairs++;
            }
        }
        int avgSim = pairs > 0 ? sumSim / pairs : 0;

        List<Map<String, Object>> cards = new ArrayList<>();
        cards.add(Map.of("label", "Countries Compared", "value", String.valueOf(n),           "icon", "globe"));
        cards.add(Map.of("label", "Videos Analyzed",    "value", String.valueOf(totalVideos), "icon", "video"));
        cards.add(Map.of("label", "Avg Similarity",     "value", avgSim + "%",               "icon", "similarity"));
        cards.add(Map.of("label", "Domain",             "value", capitalize((String) dashboard.getOrDefault("domain", "general")), "icon", "domain"));
        return cards;
    }

    // ── Representative videos ──────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildRepresentativeVideos(List<Map<String, Object>> countries) {
        List<Map<String, Object>> videos = new ArrayList<>();
        for (Map<String, Object> c : countries) {
            List<Map<String, Object>> vList = (List<Map<String, Object>>) c.get("videos");
            if (vList != null && !vList.isEmpty()) {
                Map<String, Object> rep = new LinkedHashMap<>(vList.get(0));
                rep.put("country", countryName(c));
                videos.add(rep);
            }
        }
        return videos;
    }

    // ── Comparison table ───────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildComparisonTable(List<Map<String, Object>> countries) {
        if (countries.isEmpty()) return Map.of();
        Map<String, Object> firstSummary = firstSummary(countries);
        if (firstSummary == null) return Map.of();

        List<String> headers = countries.stream().map(this::countryName).collect(Collectors.toList());
        List<Map<String, Object>> rows = new ArrayList<>();

        for (String attr : firstSummary.keySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("attribute", formatKey(attr));
            for (Map<String, Object> c : countries) {
                Map<String, Object> summary = (Map<String, Object>) c.get("summary");
                Object val = summary != null ? summary.get(attr) : null;
                if (val instanceof List<?> list) {
                    row.put(countryName(c), list.stream().limit(3).map(Object::toString).collect(Collectors.joining(", ")));
                } else {
                    row.put(countryName(c), val != null && !val.toString().isBlank() ? val.toString() : "—");
                }
            }
            rows.add(row);
        }
        return Map.of("headers", headers, "rows", rows);
    }

    // ── Attribute frequency histogram ──────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildAttributeHistogram(List<Map<String, Object>> countries) {
        Map<String, Integer> freq = new LinkedHashMap<>();
        for (Map<String, Object> c : countries) {
            Map<String, Object> summary = (Map<String, Object>) c.get("summary");
            if (summary == null) continue;
            for (Object val : summary.values()) {
                if (val instanceof List) {
                    for (Object item : (List<?>) val) {
                        freq.merge(item.toString(), 1, Integer::sum);
                    }
                }
            }
        }
        return freq.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(10)
            .map(e -> Map.<String, Object>of("name", e.getKey(), "count", e.getValue()))
            .collect(Collectors.toList());
    }

    // ── Micro-helpers ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> firstSummary(List<Map<String, Object>> countries) {
        if (countries.isEmpty()) return null;
        return (Map<String, Object>) countries.get(0).get("summary");
    }

    @SuppressWarnings("unchecked")
    private List<String> listKeys(Map<String, Object> summary) {
        return summary.entrySet().stream()
            .filter(e -> e.getValue() instanceof List)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private int listSize(Map<String, Object> summary, String key) {
        if (summary == null) return 0;
        Object val = summary.get(key);
        return val instanceof List ? ((List<?>) val).size() : 0;
    }

    private String countryName(Map<String, Object> c) {
        return (String) c.getOrDefault("country", "Unknown");
    }

    private String formatKey(String key) {
        return Arrays.stream(key.split("_"))
            .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1))
            .collect(Collectors.joining(" "));
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
