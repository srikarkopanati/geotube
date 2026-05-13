package com.geotube.controller;

import com.geotube.dto.CityResult;
import com.geotube.dto.CountryResult;
import com.geotube.dto.SearchRequest;
import com.geotube.dto.VideoResult;
import com.geotube.service.VideoService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VideoController {

    private static final Logger log = LoggerFactory.getLogger(VideoController.class);

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    /** POST /api/search — returns country-level hotspots */
    @PostMapping("/search")
    public ResponseEntity<List<CountryResult>> search(@Valid @RequestBody SearchRequest request) {
        log.info("POST /api/search — query: '{}'", request.getQuery());
        return ResponseEntity.ok(videoService.search(request.getQuery().trim()));
    }

    /** GET /api/country/{country}?query=... — returns city-level hotspots */
    @GetMapping("/country/{country}")
    public ResponseEntity<List<CityResult>> getCities(
            @PathVariable String country,
            @RequestParam String query) {
        log.info("GET /api/country/{} — query: '{}'", country, query);
        return ResponseEntity.ok(videoService.getCitiesByCountry(country, query));
    }

    /** GET /api/city/{city}?query=... — returns individual videos */
    @GetMapping("/city/{city}")
    public ResponseEntity<List<VideoResult>> getVideos(
            @PathVariable String city,
            @RequestParam String query) {
        log.info("GET /api/city/{} — query: '{}'", city, query);
        return ResponseEntity.ok(videoService.getVideosByCity(city, query));
    }
}
