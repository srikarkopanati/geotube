package com.geotube.controller;

import com.geotube.dto.AnalysisRequest;
import com.geotube.dto.ChatRequest;
import com.geotube.service.AnalysisService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analyze")
public class AnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AnalysisController.class);

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /**
     * POST /api/analyze
     * Runs the full comparative analysis pipeline for the given query + countries.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> analyze(@Valid @RequestBody AnalysisRequest request) {
        log.info("POST /api/analyze — query='{}', countries={}", request.getQuery(), request.getCountries());
        Map<String, Object> result = analysisService.analyze(
            request.getQuery().trim(),
            request.getCountries()
        );
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/analyze/chat
     * Answers a free-form question about a previously run comparison using Claude.
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@Valid @RequestBody ChatRequest request) {
        log.info("POST /api/analyze/chat — question='{}'", request.getQuestion());
        Map<String, Object> result = analysisService.chat(request);
        return ResponseEntity.ok(result);
    }
}
