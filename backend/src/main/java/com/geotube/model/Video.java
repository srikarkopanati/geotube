package com.geotube.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "videos")
@CompoundIndexes({
    @CompoundIndex(name = "query_country", def = "{'query': 1, 'country': 1}"),
    @CompoundIndex(name = "query_city",    def = "{'query': 1, 'city': 1}")
})
public class Video {

    @Id
    private String id;

    @Indexed
    private String query;

    @Indexed
    private String videoId;

    private String title;
    private String description;
    private String thumbnail;
    private String channelId;

    // Country-level coordinates (from static mapping, not GPS)
    private Double latitude;
    private Double longitude;

    @Indexed
    private String country;

    // Kept for API compatibility; set to country name in NLP-inferred videos
    private String city;

    private String publishedAt;

    // NLP inference metadata
    private String  inferenceSource;  // "direct_mention" | "city_dictionary"
    private Double  confidence;       // 0.9 – 1.0

    private LocalDateTime cachedAt;

    public Video() {}

    public String getId()                       { return id; }
    public void   setId(String id)              { this.id = id; }

    public String getQuery()                    { return query; }
    public void   setQuery(String v)            { this.query = v; }

    public String getVideoId()                  { return videoId; }
    public void   setVideoId(String v)          { this.videoId = v; }

    public String getTitle()                    { return title; }
    public void   setTitle(String v)            { this.title = v; }

    public String getDescription()              { return description; }
    public void   setDescription(String v)      { this.description = v; }

    public String getThumbnail()                { return thumbnail; }
    public void   setThumbnail(String v)        { this.thumbnail = v; }

    public String getChannelId()                { return channelId; }
    public void   setChannelId(String v)        { this.channelId = v; }

    public Double getLatitude()                 { return latitude; }
    public void   setLatitude(Double v)         { this.latitude = v; }

    public Double getLongitude()                { return longitude; }
    public void   setLongitude(Double v)        { this.longitude = v; }

    public String getCountry()                  { return country; }
    public void   setCountry(String v)          { this.country = v; }

    public String getCity()                     { return city; }
    public void   setCity(String v)             { this.city = v; }

    public String getPublishedAt()              { return publishedAt; }
    public void   setPublishedAt(String v)      { this.publishedAt = v; }

    public String getInferenceSource()          { return inferenceSource; }
    public void   setInferenceSource(String v)  { this.inferenceSource = v; }

    public Double getConfidence()               { return confidence; }
    public void   setConfidence(Double v)       { this.confidence = v; }

    public LocalDateTime getCachedAt()              { return cachedAt; }
    public void          setCachedAt(LocalDateTime v) { this.cachedAt = v; }
}
