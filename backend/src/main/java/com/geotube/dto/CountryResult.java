package com.geotube.dto;

public record CountryResult(
        String country,
        Double latitude,
        Double longitude,
        Integer videoCount
) {}
