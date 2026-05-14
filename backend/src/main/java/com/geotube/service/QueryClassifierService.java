package com.geotube.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Classifies a free-text query into a broad domain (food, automotive, technology …)
 * so the appropriate extraction schema can be selected.
 * Pure rule-based — no external API calls, so classification is instant.
 */
@Service
public class QueryClassifierService {

    private static final Map<String, List<String>> DOMAIN_KEYWORDS = Map.ofEntries(
        Map.entry("food", List.of(
            "food", "recipe", "cooking", "cuisine", "restaurant", "eat", "dish",
            "meal", "snack", "dessert", "drink", "beverage", "chef", "kitchen",
            "street food", "breakfast", "lunch", "dinner", "bake", "grill",
            "ice cream", "coffee", "tea", "sushi", "pizza", "burger", "noodle",
            "curry", "soup", "salad", "seafood", "vegetarian", "vegan"
        )),
        Map.entry("automotive", List.of(
            "car", "vehicle", "automobile", "auto", "drive", "driving", "road",
            "race", "racing", "motor", "engine", "electric car", "ev", "suv",
            "truck", "motorcycle", "bike", "sedan", "coupe", "tesla", "bmw",
            "toyota", "honda", "ford", "supercar", "hypercar", "test drive"
        )),
        Map.entry("technology", List.of(
            "technology", "tech", "software", "hardware", "programming", "coding",
            "developer", "artificial intelligence", "ai", "machine learning", "ml",
            "deep learning", "neural network", "python", "javascript", "app",
            "startup", "gadget", "smartphone", "computer", "robotics", "blockchain",
            "data science", "cloud", "cybersecurity", "web development"
        )),
        Map.entry("music", List.of(
            "music", "song", "songs", "band", "singer", "concert", "album",
            "guitar", "piano", "drums", "dance", "festival", "rap", "hip hop",
            "rock", "pop", "classical", "jazz", "electronic", "dj", "violin",
            "lyrics", "performance", "live music", "musician", "instrument"
        )),
        Map.entry("sports", List.of(
            "sport", "sports", "football", "soccer", "basketball", "baseball",
            "tennis", "cricket", "rugby", "hockey", "volleyball", "swimming",
            "athletics", "Olympics", "gym", "fitness", "workout", "training",
            "marathon", "cycling", "skiing", "surfing", "boxing", "martial arts"
        )),
        Map.entry("travel", List.of(
            "travel", "tour", "tourism", "vacation", "holiday", "trip",
            "adventure", "backpacking", "exploring", "sightseeing", "walking tour",
            "travel vlog", "destination", "airport", "hotel", "hostel",
            "landmark", "museum", "beach", "mountain", "city", "culture"
        )),
        Map.entry("fashion", List.of(
            "fashion", "style", "clothing", "outfit", "dress", "shoes",
            "accessories", "luxury", "designer", "brand", "streetwear",
            "runway", "model", "shopping", "wardrobe", "trend"
        )),
        Map.entry("nature", List.of(
            "nature", "wildlife", "animal", "animals", "forest", "jungle",
            "ocean", "sea", "river", "lake", "bird", "fish", "plant",
            "ecology", "environment", "conservation", "safari", "national park"
        ))
    );

    /**
     * Returns a domain string for the given query, defaulting to "general" when
     * no domain reaches a confidence threshold.
     */
    public String classify(String query) {
        if (query == null || query.isBlank()) return "general";

        String lower = query.toLowerCase();
        String bestDomain = "general";
        int    bestScore  = 0;

        for (Map.Entry<String, List<String>> entry : DOMAIN_KEYWORDS.entrySet()) {
            int score = 0;
            for (String keyword : entry.getValue()) {
                if (lower.contains(keyword)) {
                    // Longer keyword match → higher weight
                    score += keyword.split("\\s+").length;
                }
            }
            if (score > bestScore) {
                bestScore  = score;
                bestDomain = entry.getKey();
            }
        }

        return bestDomain;
    }
}
