package com.geotube.dto;

public record CityResult(
        String city,
        String country,
        Double latitude,
        Double longitude,
        Integer videoCount
) {}
