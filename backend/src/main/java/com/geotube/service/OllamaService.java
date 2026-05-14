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
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Local Ollama inference service. Replaces external Claude API calls for
 * extraction, comparison narrative generation, and AI chat.
 *
 * Requires Ollama running at ollama.base.url (default http://localhost:11434).
 * Model is configurable via ollama.model (default llama3).
 */
@Service
public class OllamaService {

    private static final Logger log = LoggerFactory.getLogger(OllamaService.class);

    @Value("${ollama.base.url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    private final WebClient    webClient;
    private final ObjectMapper objectMapper;

    public OllamaService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient    = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends a prompt to Ollama /api/generate and returns the response text.
     * Throws RuntimeException if Ollama is unreachable or returns an error.
     */
    public String generate(String prompt) {
        Map<String, Object> body = Map.of(
            "model",  ollamaModel,
            "prompt", prompt,
            "stream", false
        );

        String raw = webClient.post()
            .uri(ollamaBaseUrl + "/api/generate")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .timeout(Duration.ofSeconds(180))
            .block();

        try {
            JsonNode root = objectMapper.readTree(raw);
            String text = root.path("response").asText();
            return stripThinkBlocks(text);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Ollama response: " + e.getMessage(), e);
        }
    }

    /**
     * Returns true if Ollama is reachable (non-blocking, 3-second timeout).
     */
    public boolean isAvailable() {
        try {
            webClient.get()
                .uri(ollamaBaseUrl + "/api/tags")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(3))
                .block();
            return true;
        } catch (Exception e) {
            log.debug("Ollama not available at {}: {}", ollamaBaseUrl, e.getMessage());
            return false;
        }
    }

    public String getModel() { return ollamaModel; }

    // Strips <think>...</think> blocks produced by reasoning models (DeepSeek-R1, QwQ, etc.)
    private static final Pattern THINK_BLOCK = Pattern.compile("<think>.*?</think>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);

    private String stripThinkBlocks(String text) {
        if (text == null) return "";
        return THINK_BLOCK.matcher(text).replaceAll("").strip();
    }
}
