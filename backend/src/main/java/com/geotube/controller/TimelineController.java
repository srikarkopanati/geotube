package com.geotube.controller;

import com.geotube.dto.TimelineResponseDTO;
import com.geotube.service.TimelineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    /**
     * GET /api/timeline?query=Olympics&year=2020
     * Returns country-level hotspot counts for videos matching the query published in that year.
     */
    @GetMapping
    public ResponseEntity<List<TimelineResponseDTO>> getTimeline(
            @RequestParam String query,
            @RequestParam int    year
    ) {
        return ResponseEntity.ok(timelineService.getTimelineData(query, year));
    }
}
