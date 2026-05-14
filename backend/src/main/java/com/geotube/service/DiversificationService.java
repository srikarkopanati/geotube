package com.geotube.service;

import com.geotube.model.Video;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Ensures geographic diversity in search results.
 *
 * Rules:
 *   - max {@value #MAX_PER_COUNTRY} videos per country
 *   - minimum {@value #MIN_COUNTRIES} distinct countries required
 *   - target {@value #TARGET_COUNTRIES} countries preferred
 *
 * Videos are assumed to arrive in YouTube relevance order;
 * that ordering is preserved within each country bucket.
 */
@Service
public class DiversificationService {

    static final int MAX_PER_COUNTRY = 10;
    static final int MIN_COUNTRIES   = 2;
    static final int TARGET_COUNTRIES = 5;

    /**
     * Caps each country at {@value #MAX_PER_COUNTRY} videos while preserving
     * the original relevance order within each country.
     *
     * @param videos inferred videos in YouTube relevance order
     * @return diversified list
     */
    public List<Video> diversify(List<Video> videos) {
        // LinkedHashMap preserves insertion order (= first-seen = most relevant)
        Map<String, List<Video>> byCountry = new LinkedHashMap<>();
        for (Video v : videos) {
            String country = v.getCountry();
            if (country == null || country.isBlank()) continue;
            byCountry.computeIfAbsent(country, k -> new ArrayList<>()).add(v);
        }

        List<Video> result = new ArrayList<>();
        for (List<Video> countryVideos : byCountry.values()) {
            int limit = Math.min(MAX_PER_COUNTRY, countryVideos.size());
            result.addAll(countryVideos.subList(0, limit));
        }
        return result;
    }

    /**
     * Returns true when at least {@value #MIN_COUNTRIES} distinct countries
     * are present in the given list.
     */
    public boolean hasSufficientDiversity(List<Video> videos) {
        long distinct = videos.stream()
                .map(Video::getCountry)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .count();
        return distinct >= MIN_COUNTRIES;
    }

    /**
     * Returns the count of distinct countries in the given list.
     */
    public long countDistinctCountries(List<Video> videos) {
        return videos.stream()
                .map(Video::getCountry)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .count();
    }
}
