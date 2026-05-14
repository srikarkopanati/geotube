package com.geotube.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Returns a domain-specific extraction schema template as an ordered Map.
 * The template defines keys and their default values (empty string or empty list)
 * so downstream services know what fields to populate.
 */
@Service
public class SchemaService {

    public Map<String, Object> getSchema(String domain) {
        return switch (domain) {
            case "food"       -> foodSchema();
            case "automotive" -> automotiveSchema();
            case "technology" -> technologySchema();
            case "music"      -> musicSchema();
            case "sports"     -> sportsSchema();
            case "travel"     -> travelSchema();
            case "fashion"    -> fashionSchema();
            case "nature"     -> natureSchema();
            default           -> generalSchema();
        };
    }

    // ── Schema definitions ────────────────────────────────────────────────

    private Map<String, Object> foodSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ingredients",    new ArrayList<>());
        m.put("flavors",        new ArrayList<>());
        m.put("price_range",    "");
        m.put("prep_style",     new ArrayList<>());
        m.put("serving_style",  "");
        m.put("special_traits", new ArrayList<>());
        return m;
    }

    private Map<String, Object> automotiveSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("brand",       "");
        m.put("engine_type", "");
        m.put("fuel_type",   "");
        m.put("price_range", "");
        m.put("features",    new ArrayList<>());
        m.put("performance", "");
        return m;
    }

    private Map<String, Object> technologySchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("tools",            new ArrayList<>());
        m.put("frameworks",       new ArrayList<>());
        m.put("topics",           new ArrayList<>());
        m.put("difficulty_level", "");
        m.put("use_cases",        new ArrayList<>());
        return m;
    }

    private Map<String, Object> musicSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("genre",       new ArrayList<>());
        m.put("instruments", new ArrayList<>());
        m.put("mood",        "");
        m.put("tempo",       "");
        m.put("themes",      new ArrayList<>());
        return m;
    }

    private Map<String, Object> sportsSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("sport",         "");
        m.put("skill_level",   "");
        m.put("equipment",     new ArrayList<>());
        m.put("techniques",    new ArrayList<>());
        m.put("highlights",    new ArrayList<>());
        return m;
    }

    private Map<String, Object> travelSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("destinations",   new ArrayList<>());
        m.put("activities",     new ArrayList<>());
        m.put("budget_level",   "");
        m.put("travel_style",   "");
        m.put("highlights",     new ArrayList<>());
        return m;
    }

    private Map<String, Object> fashionSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("style",          "");
        m.put("brands",         new ArrayList<>());
        m.put("price_range",    "");
        m.put("trends",         new ArrayList<>());
        m.put("occasions",      new ArrayList<>());
        return m;
    }

    private Map<String, Object> natureSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("species",        new ArrayList<>());
        m.put("habitats",       new ArrayList<>());
        m.put("behaviors",      new ArrayList<>());
        m.put("conservation",   "");
        m.put("highlights",     new ArrayList<>());
        return m;
    }

    private Map<String, Object> generalSchema() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("topics",     new ArrayList<>());
        m.put("themes",     new ArrayList<>());
        m.put("highlights", new ArrayList<>());
        m.put("style",      "");
        return m;
    }
}
