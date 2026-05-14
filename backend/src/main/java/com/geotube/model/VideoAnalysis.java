package com.geotube.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "video_analysis")
@CompoundIndex(name = "query_country_video", def = "{'query': 1, 'country': 1, 'videoId': 1}", unique = true)
public class VideoAnalysis {

    @Id
    private String id;
    private String query;
    private String country;
    private String videoId;
    private String domain;
    private String schemaType;
    private Map<String, Object> attributes;
    private LocalDateTime cachedAt;

    public VideoAnalysis() {}

    public String getId()                            { return id; }
    public void   setId(String v)                   { this.id = v; }

    public String getQuery()                         { return query; }
    public void   setQuery(String v)                { this.query = v; }

    public String getCountry()                       { return country; }
    public void   setCountry(String v)              { this.country = v; }

    public String getVideoId()                       { return videoId; }
    public void   setVideoId(String v)              { this.videoId = v; }

    public String getDomain()                        { return domain; }
    public void   setDomain(String v)               { this.domain = v; }

    public String getSchemaType()                    { return schemaType; }
    public void   setSchemaType(String v)           { this.schemaType = v; }

    public Map<String, Object> getAttributes()       { return attributes; }
    public void                setAttributes(Map<String, Object> v) { this.attributes = v; }

    public LocalDateTime getCachedAt()               { return cachedAt; }
    public void          setCachedAt(LocalDateTime v){ this.cachedAt = v; }
}
