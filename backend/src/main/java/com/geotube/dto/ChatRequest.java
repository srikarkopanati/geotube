package com.geotube.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

public class ChatRequest {

    @NotBlank(message = "Query must not be blank")
    private String query;

    @NotNull(message = "Countries list must not be null")
    private List<String> countries;

    @NotBlank(message = "Question must not be blank")
    private String question;

    /** Optional: cached analysis context from a prior /api/analyze call. */
    private Map<String, Object> analysisContext;

    public ChatRequest() {}

    public String getQuery()                            { return query; }
    public void   setQuery(String v)                   { this.query = v; }

    public List<String> getCountries()                  { return countries; }
    public void         setCountries(List<String> v)   { this.countries = v; }

    public String getQuestion()                         { return question; }
    public void   setQuestion(String v)                { this.question = v; }

    public Map<String, Object> getAnalysisContext()     { return analysisContext; }
    public void                setAnalysisContext(Map<String, Object> v) { this.analysisContext = v; }
}
