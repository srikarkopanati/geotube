package com.geotube.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "comparison_cache")
public class ComparisonCache {

    @Id
    private String id;

    private String query;

    /** Alphabetically sorted list of country names — defines cache identity. */
    private List<String> countries;

    /** Composite key = query + "|" + sorted-countries — fast equality lookup. */
    @Indexed(unique = true)
    private String cacheKey;

    private Map<String, Object> dashboard;
    private LocalDateTime cachedAt;

    public ComparisonCache() {}

    public String getId()                                { return id; }
    public void   setId(String v)                       { this.id = v; }

    public String getQuery()                             { return query; }
    public void   setQuery(String v)                    { this.query = v; }

    public List<String> getCountries()                   { return countries; }
    public void         setCountries(List<String> v)    { this.countries = v; }

    public String getCacheKey()                          { return cacheKey; }
    public void   setCacheKey(String v)                 { this.cacheKey = v; }

    public Map<String, Object> getDashboard()            { return dashboard; }
    public void                setDashboard(Map<String, Object> v) { this.dashboard = v; }

    public LocalDateTime getCachedAt()                   { return cachedAt; }
    public void          setCachedAt(LocalDateTime v)   { this.cachedAt = v; }
}
