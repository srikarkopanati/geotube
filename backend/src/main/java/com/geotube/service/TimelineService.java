package com.geotube.service;

import com.geotube.dto.TimelineResponseDTO;
import com.geotube.model.Video;
import com.geotube.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Returns country-level hotspot data for a given query filtered to a specific year.
 * Populates the video cache via VideoService if the query has never been searched.
 */
@Service
public class TimelineService {

    private static final Logger log = LoggerFactory.getLogger(TimelineService.class);

    private final VideoRepository videoRepository;
    private final VideoService    videoService;

    public TimelineService(VideoRepository videoRepository, VideoService videoService) {
        this.videoRepository = videoRepository;
        this.videoService    = videoService;
    }

    public List<TimelineResponseDTO> getTimelineData(String query, int year) {
        // Populate cache on first call for this query
        if (!videoRepository.existsByQuery(query)) {
            log.info("Timeline: no cache for '{}' — triggering search", query);
            try {
                videoService.search(query);
            } catch (Exception e) {
                log.warn("Timeline pre-fetch failed for '{}': {}", query, e.getMessage());
                return List.of();
            }
        }

        List<Video> all = videoRepository.findByQuery(query);
        String yearPrefix = String.valueOf(year);

        // Filter by published year (publishedAt is stored as ISO-8601 string)
        List<Video> forYear = all.stream()
                .filter(v -> v.getPublishedAt() != null && v.getPublishedAt().startsWith(yearPrefix))
                .filter(v -> v.getCountry() != null && v.getLatitude() != null && v.getLongitude() != null)
                .toList();

        if (forYear.isEmpty()) {
            log.info("Timeline: 0 videos for query='{}' year={}", query, year);
            return List.of();
        }

        Map<String, List<Video>> byCountry = forYear.stream()
                .collect(Collectors.groupingBy(Video::getCountry));

        return byCountry.entrySet().stream()
                .map(entry -> {
                    Video first = entry.getValue().get(0);
                    return new TimelineResponseDTO(
                            entry.getKey(),
                            first.getLatitude(),
                            first.getLongitude(),
                            entry.getValue().size()
                    );
                })
                .sorted(Comparator.comparingInt(TimelineResponseDTO::videoCount).reversed())
                .toList();
    }
}
