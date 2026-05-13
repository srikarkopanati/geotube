package com.geotube.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    @Value("${nominatim.base.url}")
    private String nominatimBaseUrl;

    @Value("${nominatim.rate-limit-ms:1200}")
    private long rateLimitMs;

    private final WebClient webClient;
    private final ConcurrentMap<String, String[]> geocodeCache = new ConcurrentHashMap<>();

    public GeocodingService(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Returns [country, city] for the given coordinates.
     * Nominatim requires max 1 req/sec — this method sleeps between calls.
     */
    public String[] reverseGeocode(double lat, double lng) {
        String cacheKey = String.format("%.2f,%.2f", lat, lng);

        if (geocodeCache.containsKey(cacheKey)) {
            return geocodeCache.get(cacheKey);
        }

        try {
            Thread.sleep(rateLimitMs);

            JsonNode response = webClient.get()
                    .uri(nominatimBaseUrl + "/reverse", uriBuilder -> uriBuilder
                            .queryParam("format", "json")
                            .queryParam("lat", lat)
                            .queryParam("lon", lng)
                            .queryParam("zoom", 10)
                            .queryParam("addressdetails", 1)
                            .build())
                    .header("User-Agent", "GeoTube/1.0 Demo Application")
                    .header("Accept-Language", "en")
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, resp -> {
                        log.warn("Nominatim returned error {} for {},{}", resp.statusCode(), lat, lng);
                        return resp.bodyToMono(String.class).map(body ->
                                new RuntimeException("Nominatim error: " + resp.statusCode()));
                    })
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("address")) {
                JsonNode address = response.get("address");
                String country = address.path("country").asText("Unknown");
                String city    = extractCity(address);
                String[] result = {country, city};
                geocodeCache.put(cacheKey, result);
                log.debug("Geocoded ({},{}) → {}/{}", lat, lng, country, city);
                return result;
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Geocoding interrupted for {},{}", lat, lng);
        } catch (Exception e) {
            log.warn("Geocoding failed for {},{}: {}", lat, lng, e.getMessage());
        }

        String[] fallback = {"Unknown", "Unknown"};
        geocodeCache.put(cacheKey, fallback);
        return fallback;
    }

    private String extractCity(JsonNode address) {
        String[] candidates = {"city", "town", "village", "suburb", "municipality",
                "county", "state_district", "state"};
        for (String field : candidates) {
            String value = address.path(field).asText("");
            if (!value.isBlank()) return value;
        }
        return "Unknown";
    }
}
