package com.geotube.dto;

import java.util.List;
import java.util.Map;

public record TrendingResponseDTO(
        String                   region,
        Double                   latitude,
        Double                   longitude,
        int                      videoCount,
        List<Map<String, Object>> topVideos
) {}
