package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Extracts structured attributes from a video's title, description and
 * (optional) transcript against a domain-specific schema.
 *
 * Strategy:
 *   1. If ANTHROPIC_API_KEY is configured → call Claude haiku for high-quality extraction.
 *   2. Otherwise → rule-based keyword extraction (always returns something useful).
 */
@Service
public class ExtractionService {

    private static final Logger log = LoggerFactory.getLogger(ExtractionService.class);

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com}")
    private String anthropicApiUrl;

    private final WebClient    webClient;
    private final ObjectMapper objectMapper;

    public ExtractionService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient    = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Extracts attributes for a single video.
     *
     * @param query      original user query (e.g. "ice cream")
     * @param domain     classified domain (e.g. "food")
     * @param schema     template from SchemaService — defines expected keys
     * @param transcript plain text (may be empty)
     * @param title      video title
     * @param description video description snippet
     * @return map of extracted attributes matching schema keys
     */
    public Map<String, Object> extract(String query, String domain,
                                       Map<String, Object> schema,
                                       String transcript, String title, String description) {
        if (isClaudeAvailable()) {
            try {
                return extractWithClaude(query, domain, schema, transcript, title, description);
            } catch (Exception e) {
                log.warn("Claude extraction failed for '{}', using rule-based fallback: {}", title, e.getMessage());
            }
        }
        return extractRuleBased(domain, schema, transcript, title, description);
    }

    // ── Claude-based extraction ───────────────────────────────────────────

    private Map<String, Object> extractWithClaude(String query, String domain,
                                                   Map<String, Object> schema,
                                                   String transcript, String title, String description) throws Exception {
        String schemaJson  = objectMapper.writeValueAsString(schema);
        String contentText = buildContentText(transcript, title, description);

        String prompt = String.format("""
                You are a video content analyst. Extract structured information from this YouTube video about "%s" (%s domain).

                Video content:
                %s

                Extract data into this exact JSON schema (fill null for unknown fields, max 5 items per list):
                %s

                Return ONLY valid JSON matching the schema. No explanation, no markdown fences.
                """, query, domain, contentText, schemaJson);

        Map<String, Object> requestBody = Map.of(
            "model",      "claude-haiku-4-5-20251001",
            "max_tokens", 1024,
            "messages",   List.of(Map.of("role", "user", "content", prompt))
        );

        String responseBody = webClient.post()
                .uri(anthropicApiUrl + "/v1/messages")
                .header("x-api-key",          anthropicApiKey)
                .header("anthropic-version",   "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .block();

        JsonNode root    = objectMapper.readTree(responseBody);
        String   jsonStr = root.path("content").get(0).path("text").asText();
        return parseJsonToMap(jsonStr, schema);
    }

    // ── Rule-based fallback ───────────────────────────────────────────────

    private Map<String, Object> extractRuleBased(String domain, Map<String, Object> schema,
                                                  String transcript, String title, String description) {
        String corpus = (title + " " + description + " " + transcript).toLowerCase();
        Map<String, Object> result = new LinkedHashMap<>();

        for (Map.Entry<String, Object> entry : schema.entrySet()) {
            String key = entry.getKey();
            Object def = entry.getValue();
            if (def instanceof List) {
                result.put(key, extractListField(key, corpus));
            } else {
                result.put(key, extractStringField(key, corpus));
            }
        }
        return result;
    }

    private List<String> extractListField(String field, String corpus) {
        return switch (field) {
            case "ingredients"  -> findMatches(corpus, INGREDIENTS);
            case "flavors"      -> findMatches(corpus, FLAVORS);
            case "prep_style"   -> findMatches(corpus, PREP_STYLES);
            case "special_traits" -> findMatches(corpus, SPECIAL_TRAITS);
            case "features"     -> findMatches(corpus, AUTO_FEATURES);
            case "tools"        -> findMatches(corpus, TECH_TOOLS);
            case "frameworks"   -> findMatches(corpus, TECH_FRAMEWORKS);
            case "topics"       -> findMatches(corpus, TOPICS);
            case "themes"       -> findMatches(corpus, THEMES);
            case "highlights"   -> extractHighlights(corpus);
            case "genre"        -> findMatches(corpus, MUSIC_GENRES);
            case "instruments"  -> findMatches(corpus, INSTRUMENTS);
            case "equipment"    -> findMatches(corpus, SPORTS_EQUIPMENT);
            case "techniques"   -> findMatches(corpus, TECHNIQUES);
            case "destinations" -> findMatches(corpus, DESTINATIONS);
            case "activities"   -> findMatches(corpus, ACTIVITIES);
            case "brands"       -> findMatches(corpus, BRANDS);
            case "trends"       -> findMatches(corpus, TRENDS);
            case "occasions"    -> findMatches(corpus, OCCASIONS);
            case "species"      -> findMatches(corpus, SPECIES);
            case "habitats"     -> findMatches(corpus, HABITATS);
            case "behaviors"    -> findMatches(corpus, BEHAVIORS);
            case "use_cases"    -> findMatches(corpus, USE_CASES);
            default             -> new ArrayList<>();
        };
    }

    private String extractStringField(String field, String corpus) {
        return switch (field) {
            case "price_range"    -> detectPriceRange(corpus);
            case "serving_style"  -> detectServingStyle(corpus);
            case "fuel_type"      -> detectFuelType(corpus);
            case "engine_type"    -> detectEngineType(corpus);
            case "performance"    -> detectPerformance(corpus);
            case "difficulty_level" -> detectDifficulty(corpus);
            case "mood"           -> detectMood(corpus);
            case "tempo"          -> detectTempo(corpus);
            case "skill_level"    -> detectSkillLevel(corpus);
            case "budget_level"   -> detectBudgetLevel(corpus);
            case "travel_style"   -> detectTravelStyle(corpus);
            case "conservation"   -> detectConservation(corpus);
            case "style"          -> detectStyle(corpus);
            default               -> "";
        };
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private boolean isClaudeAvailable() {
        return anthropicApiKey != null && !anthropicApiKey.isBlank();
    }

    private String buildContentText(String transcript, String title, String description) {
        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(title).append('\n');
        if (description != null && !description.isBlank()) {
            String desc = description.length() > 500 ? description.substring(0, 500) + "…" : description;
            sb.append("Description: ").append(desc).append('\n');
        }
        if (transcript != null && !transcript.isBlank()) {
            String tr = transcript.length() > 2000 ? transcript.substring(0, 2000) + "…" : transcript;
            sb.append("Transcript: ").append(tr);
        }
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonToMap(String jsonStr, Map<String, Object> schema) {
        try {
            // Strip markdown fences if present
            jsonStr = jsonStr.replaceAll("(?s)```(?:json)?\\s*", "").replaceAll("```", "").trim();
            JsonNode node = objectMapper.readTree(jsonStr);
            Map<String, Object> parsed = objectMapper.convertValue(node, Map.class);
            // Ensure all schema keys are present
            Map<String, Object> result = new LinkedHashMap<>(schema);
            result.putAll(parsed);
            return result;
        } catch (Exception e) {
            log.warn("Failed to parse Claude JSON response: {}", e.getMessage());
            return new LinkedHashMap<>(schema);
        }
    }

    private List<String> findMatches(String corpus, String[] candidates) {
        List<String> found = new ArrayList<>();
        for (String c : candidates) {
            if (corpus.contains(c) && found.size() < 5) {
                found.add(toTitleCase(c));
            }
        }
        return found;
    }

    private List<String> extractHighlights(String corpus) {
        // Return the first two non-trivial words/phrases from the corpus
        String[] words = corpus.split("[\\s,;]+");
        List<String> highlights = new ArrayList<>();
        for (String w : words) {
            if (w.length() > 5 && !STOP_WORDS.contains(w) && highlights.size() < 3) {
                highlights.add(toTitleCase(w));
            }
        }
        return highlights;
    }

    private String toTitleCase(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private String detectPriceRange(String c) {
        if (c.contains("cheap") || c.contains("affordable") || c.contains("budget") || c.contains("inexpensive")) return "budget";
        if (c.contains("expensive") || c.contains("luxury") || c.contains("premium") || c.contains("high-end")) return "premium";
        if (c.contains("mid-range") || c.contains("moderate") || c.contains("reasonable")) return "mid-range";
        return "varies";
    }
    private String detectServingStyle(String c) {
        if (c.contains("soft serve") || c.contains("soft-serve")) return "Soft Serve";
        if (c.contains("scoop") || c.contains("cone")) return "Scooped";
        if (c.contains("sundae")) return "Sundae";
        if (c.contains("bar")) return "Bar";
        if (c.contains("cup")) return "Cup";
        return "";
    }
    private String detectFuelType(String c) {
        if (c.contains("electric") || c.contains("ev") || c.contains("battery")) return "Electric";
        if (c.contains("hybrid")) return "Hybrid";
        if (c.contains("diesel")) return "Diesel";
        if (c.contains("petrol") || c.contains("gasoline") || c.contains("gas")) return "Petrol";
        return "";
    }
    private String detectEngineType(String c) {
        if (c.contains("v8")) return "V8"; if (c.contains("v6")) return "V6";
        if (c.contains("inline 4") || c.contains("i4")) return "Inline-4";
        if (c.contains("turbocharged") || c.contains("turbo")) return "Turbocharged";
        return "";
    }
    private String detectPerformance(String c) {
        if (c.contains("supercar") || c.contains("hypercar") || c.contains("fastest")) return "High Performance";
        if (c.contains("family") || c.contains("commuter") || c.contains("economy")) return "Standard";
        return "";
    }
    private String detectDifficulty(String c) {
        if (c.contains("beginner") || c.contains("easy") || c.contains("introduction") || c.contains("basics")) return "Beginner";
        if (c.contains("advanced") || c.contains("expert") || c.contains("mastery")) return "Advanced";
        if (c.contains("intermediate") || c.contains("mid-level")) return "Intermediate";
        return "";
    }
    private String detectMood(String c) {
        if (c.contains("happy") || c.contains("upbeat") || c.contains("energetic")) return "Upbeat";
        if (c.contains("sad") || c.contains("melancholy") || c.contains("emotional")) return "Melancholic";
        if (c.contains("calm") || c.contains("relaxing") || c.contains("peaceful")) return "Calm";
        return "";
    }
    private String detectTempo(String c) {
        if (c.contains("fast") || c.contains("upbeat") || c.contains("energetic")) return "Fast";
        if (c.contains("slow") || c.contains("ballad") || c.contains("gentle")) return "Slow";
        if (c.contains("moderate") || c.contains("medium tempo")) return "Moderate";
        return "";
    }
    private String detectSkillLevel(String c) {
        if (c.contains("professional") || c.contains("elite") || c.contains("olympic")) return "Professional";
        if (c.contains("amateur") || c.contains("recreational") || c.contains("casual")) return "Amateur";
        if (c.contains("youth") || c.contains("junior")) return "Youth";
        return "";
    }
    private String detectBudgetLevel(String c) {
        if (c.contains("budget") || c.contains("backpacker") || c.contains("cheap")) return "Budget";
        if (c.contains("luxury") || c.contains("five-star") || c.contains("premium")) return "Luxury";
        if (c.contains("mid-range") || c.contains("moderate")) return "Mid-range";
        return "";
    }
    private String detectTravelStyle(String c) {
        if (c.contains("adventure") || c.contains("hiking") || c.contains("outdoor")) return "Adventure";
        if (c.contains("cultural") || c.contains("heritage") || c.contains("historic")) return "Cultural";
        if (c.contains("relaxation") || c.contains("beach") || c.contains("resort")) return "Leisure";
        if (c.contains("food") || c.contains("culinary") || c.contains("cuisine")) return "Culinary";
        return "";
    }
    private String detectConservation(String c) {
        if (c.contains("endangered") || c.contains("extinct") || c.contains("threatened")) return "Endangered";
        if (c.contains("protected") || c.contains("conservation")) return "Protected";
        return "";
    }
    private String detectStyle(String c) {
        if (c.contains("traditional") || c.contains("classic") || c.contains("heritage")) return "Traditional";
        if (c.contains("modern") || c.contains("contemporary") || c.contains("trendy")) return "Modern";
        if (c.contains("fusion") || c.contains("hybrid")) return "Fusion";
        return "";
    }

    // ── Keyword lists ─────────────────────────────────────────────────────

    private static final String[] INGREDIENTS = {
        "milk","cream","sugar","butter","egg","flour","vanilla","chocolate","matcha",
        "strawberry","mango","honey","coconut","pistachio","saffron","cardamom",
        "condensed milk","rose","fruit","nut","almond","cashew","walnut"
    };
    private static final String[] FLAVORS = {
        "sweet","savory","spicy","sour","bitter","umami","salty","tangy","rich",
        "creamy","fruity","nutty","floral","earthy","smoky","caramel","minty",
        "chocolate","vanilla","matcha","tropical","citrus"
    };
    private static final String[] PREP_STYLES = {
        "baked","fried","grilled","steamed","raw","fermented","slow-cooked",
        "churned","frozen","handmade","artisanal","street-style","traditional"
    };
    private static final String[] SPECIAL_TRAITS = {
        "vegan","gluten-free","organic","halal","kosher","spicy","seasonal",
        "regional","award-winning","fusion","artisanal","family recipe","secret recipe"
    };
    private static final String[] AUTO_FEATURES = {
        "autopilot","navigation","sunroof","leather seats","heated seats",
        "awd","4wd","turbocharged","sport mode","electric range","fast charging"
    };
    private static final String[] TECH_TOOLS = {
        "python","java","javascript","typescript","rust","go","c++","sql",
        "docker","kubernetes","git","linux","aws","azure","gcp"
    };
    private static final String[] TECH_FRAMEWORKS = {
        "react","angular","vue","spring","django","flask","tensorflow","pytorch",
        "node.js","express","next.js","fastapi","spring boot","rails"
    };
    private static final String[] TOPICS = {
        "history","science","culture","art","politics","economy","health",
        "education","entertainment","sports","travel","food","technology"
    };
    private static final String[] THEMES = {
        "tradition","innovation","community","identity","sustainability",
        "diversity","heritage","modernity","globalization","local"
    };
    private static final String[] MUSIC_GENRES = {
        "pop","rock","jazz","classical","hip hop","electronic","folk","r&b",
        "country","reggae","metal","punk","indie","soul","blues"
    };
    private static final String[] INSTRUMENTS = {
        "guitar","piano","drums","violin","bass","saxophone","trumpet","flute",
        "keyboard","sitar","tabla","cello","ukulele"
    };
    private static final String[] SPORTS_EQUIPMENT = {
        "ball","racket","gloves","helmet","shoes","jersey","bat","stick",
        "board","bike","skis","weights","mat"
    };
    private static final String[] TECHNIQUES = {
        "technique","drill","strategy","tactics","training","conditioning",
        "footwork","spin","swing","serve","kick","throw"
    };
    private static final String[] DESTINATIONS = {
        "tokyo","paris","london","new york","rome","dubai","singapore","sydney",
        "bali","barcelona","istanbul","amsterdam","bangkok","mumbai"
    };
    private static final String[] ACTIVITIES = {
        "hiking","swimming","snorkeling","skiing","surfing","cycling","sightseeing",
        "shopping","cooking class","museum","temple","beach","safari"
    };
    private static final String[] BRANDS = {
        "gucci","prada","chanel","louis vuitton","nike","adidas","zara","h&m",
        "supreme","off-white","versace","dior","balenciaga"
    };
    private static final String[] TRENDS = {
        "streetwear","minimalism","maximalism","vintage","retro","sustainable",
        "athleisure","oversized","monochrome","layering"
    };
    private static final String[] OCCASIONS = {
        "casual","formal","wedding","work","party","sports","beach","travel","date"
    };
    private static final String[] SPECIES = {
        "lion","elephant","whale","dolphin","eagle","tiger","bear","wolf",
        "panda","gorilla","cheetah","penguin","turtle","shark"
    };
    private static final String[] HABITATS = {
        "rainforest","savanna","ocean","reef","desert","mountain","tundra",
        "wetland","grassland","forest","arctic"
    };
    private static final String[] BEHAVIORS = {
        "migration","hunting","mating","social","territorial","nocturnal",
        "feeding","nesting","playing","cooperating"
    };
    private static final String[] USE_CASES = {
        "automation","data analysis","web development","mobile app","api",
        "machine learning","devops","security","testing","deployment"
    };

    private static final java.util.Set<String> STOP_WORDS = new java.util.HashSet<>(Arrays.asList(
        "about","after","also","from","have","here","just","know","like",
        "make","more","most","much","only","over","some","such","than",
        "that","their","them","then","there","these","they","this","those",
        "through","time","under","very","what","when","where","which","while",
        "with","your","https","watch","video","channel","subscribe","youtube"
    ));
}
