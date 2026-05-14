package com.geotube.dto;

public record TimelineResponseDTO(
        String country,
        Double latitude,
        Double longitude,
        int    videoCount
) {}
