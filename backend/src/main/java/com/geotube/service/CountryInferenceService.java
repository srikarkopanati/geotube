package com.geotube.service;

import com.geotube.util.CountryCoordinates;
import com.geotube.util.GazetteerData;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Fast, rule-based country inference from video metadata.
 *
 * Priority pipeline (short-circuits on first match):
 *   1. Direct country-name / alias detection  → confidence 1.0
 *   2. City gazetteer lookup                  → confidence 0.9
 *   3. No match → discard (confidence 0.0)
 *
 * All string ops run on a single lowercased copy of the combined text,
 * so there are no per-token allocations in the hot path.
 */
@Service
public class CountryInferenceService {

    // -----------------------------------------------------------------------
    // Country names (exact) — sorted longest-first to avoid short names
    // matching inside longer ones (e.g. "Iran" inside "Ukraine").
    // -----------------------------------------------------------------------
    private static final List<String> SORTED_COUNTRY_NAMES;

    // Alias → canonical country name
    private static final Map<String, String> COUNTRY_ALIASES;

    // Sorted alias entries (longest first, same reason as above)
    private static final List<Map.Entry<String, String>> SORTED_ALIAS_ENTRIES;

    static {
        List<String> names = new ArrayList<>(CountryCoordinates.allCountries());
        names.sort(Comparator.comparingInt(s -> -s.length()));
        SORTED_COUNTRY_NAMES = Collections.unmodifiableList(names);

        Map<String, String> aliases = new HashMap<>();
        aliases.put("united states of america", "USA");
        aliases.put("united states",            "USA");
        aliases.put("america",                  "USA");
        aliases.put("u.s.a.",                   "USA");
        aliases.put("u.s.",                     "USA");
        aliases.put("great britain",            "United Kingdom");
        aliases.put("uk",                       "United Kingdom");
        aliases.put("england",                  "United Kingdom");
        aliases.put("scotland",                 "United Kingdom");
        aliases.put("wales",                    "United Kingdom");
        aliases.put("northern ireland",         "United Kingdom");
        aliases.put("holland",                  "Netherlands");
        aliases.put("south korea",              "South Korea");   // already canonical
        aliases.put("north korea",              "North Korea");
        aliases.put("republic of korea",        "South Korea");
        aliases.put("uae",                      "UAE");
        aliases.put("united arab emirates",     "UAE");
        aliases.put("czech republic",           "Czech Republic");
        aliases.put("czechia",                  "Czech Republic");
        aliases.put("new zealand",              "New Zealand");
        aliases.put("south africa",             "South Africa");
        aliases.put("saudi arabia",             "Saudi Arabia");
        aliases.put("sri lanka",                "Sri Lanka");
        aliases.put("trinidad",                 "Trinidad and Tobago");
        aliases.put("costa rica",               "Costa Rica");
        aliases.put("puerto rico",              "Puerto Rico");
        aliases.put("dominican republic",       "Dominican Republic");
        COUNTRY_ALIASES = Collections.unmodifiableMap(aliases);

        List<Map.Entry<String, String>> aliasList = new ArrayList<>(aliases.entrySet());
        aliasList.sort(Comparator.comparingInt(e -> -e.getKey().length()));
        SORTED_ALIAS_ENTRIES = Collections.unmodifiableList(aliasList);
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Infers a country from video title, description, and tags.
     *
     * @return an InferenceResult; country is null when confidence == 0.0 (discard).
     */
    public InferenceResult infer(String title, String description, List<String> tags) {
        String text = buildSearchText(title, description, tags);

        // Step 1 — direct country name
        for (String country : SORTED_COUNTRY_NAMES) {
            if (containsPhrase(text, country.toLowerCase())) {
                return new InferenceResult(country, 1.0, "direct_mention");
            }
        }

        // Step 1b — country aliases
        for (Map.Entry<String, String> alias : SORTED_ALIAS_ENTRIES) {
            if (containsPhrase(text, alias.getKey())) {
                return new InferenceResult(alias.getValue(), 1.0, "direct_mention");
            }
        }

        // Step 2 — city gazetteer (longest match first to avoid partial hits)
        for (Map.Entry<String, String> entry : GazetteerData.SORTED_ENTRIES) {
            if (text.contains(entry.getKey())) {
                return new InferenceResult(entry.getValue(), 0.9, "city_dictionary");
            }
        }

        // No match — discard
        return new InferenceResult(null, 0.0, "unknown");
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Builds a single lowercase search string from all available metadata.
     * Description is capped at 1 000 chars to keep processing time bounded.
     */
    private String buildSearchText(String title, String description, List<String> tags) {
        StringBuilder sb = new StringBuilder(1500);
        if (title != null && !title.isBlank()) {
            sb.append(title).append(' ');
        }
        if (description != null && !description.isBlank()) {
            int len = Math.min(description.length(), 1000);
            sb.append(description, 0, len).append(' ');
        }
        if (tags != null) {
            for (String tag : tags) {
                if (tag != null && !tag.isBlank()) {
                    sb.append(tag).append(' ');
                }
            }
        }
        return sb.toString().toLowerCase();
    }

    /**
     * True when {@code phrase} appears in {@code text} at a word boundary on
     * both sides, preventing "iran" from matching inside "ukraine".
     */
    private boolean containsPhrase(String text, String phrase) {
        int idx = text.indexOf(phrase);
        while (idx >= 0) {
            boolean leftOk  = idx == 0
                    || !Character.isLetterOrDigit(text.charAt(idx - 1));
            boolean rightOk = idx + phrase.length() >= text.length()
                    || !Character.isLetterOrDigit(text.charAt(idx + phrase.length()));
            if (leftOk && rightOk) return true;
            idx = text.indexOf(phrase, idx + 1);
        }
        return false;
    }

    // -----------------------------------------------------------------------
    // Result type
    // -----------------------------------------------------------------------

    public record InferenceResult(
            String country,
            double confidence,
            String source
    ) {
        public boolean resolved() {
            return country != null && !country.isBlank();
        }
    }
}
