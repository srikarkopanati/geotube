package com.geotube.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class AnalysisRequest {

    @NotBlank(message = "Query must not be blank")
    private String query;

    @NotNull(message = "Countries list must not be null")
    @Size(min = 2, max = 4, message = "Select between 2 and 4 countries to compare")
    private List<String> countries;

    public AnalysisRequest() {}

    public String getQuery()                  { return query; }
    public void   setQuery(String v)         { this.query = v; }

    public List<String> getCountries()        { return countries; }
    public void         setCountries(List<String> v) { this.countries = v; }
}
