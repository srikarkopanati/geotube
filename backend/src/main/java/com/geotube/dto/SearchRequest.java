package com.geotube.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SearchRequest {

    @NotBlank(message = "Query must not be blank")
    @Size(min = 1, max = 200, message = "Query must be between 1 and 200 characters")
    private String query;

    public String getQuery()             { return query; }
    public void   setQuery(String query) { this.query = query; }
}
