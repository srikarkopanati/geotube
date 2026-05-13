package com.geotube.dto;

public record VideoResult(
        String videoId,
        String title,
        String description,
        String thumbnail,
        Double latitude,
        Double longitude,
        String country,
        String city,
        String publishedAt
) {}
