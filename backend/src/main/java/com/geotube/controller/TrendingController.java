package com.geotube.controller;

import com.geotube.dto.TrendingResponseDTO;
import com.geotube.service.TrendingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trending")
public class TrendingController {

    private final TrendingService trendingService;

    public TrendingController(TrendingService trendingService) {
        this.trendingService = trendingService;
    }

    /**
     * GET /api/trending
     * Returns the latest cached trending hotspots for all monitored regions.
     */
    @GetMapping
    public ResponseEntity<List<TrendingResponseDTO>> getTrending() {
        return ResponseEntity.ok(trendingService.getTrending());
    }
}
