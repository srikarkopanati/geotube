package com.geotube.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "trending")
public class TrendingData {

    @Id
    private String id;

    @Indexed(unique = true)
    private String regionCode;

    private String regionName;
    private Double latitude;
    private Double longitude;
    private List<String> videoIds;
    private List<TrendingVideoData> topVideos;
    private LocalDateTime updatedAt;

    public TrendingData() {}

    public String getId()               { return id; }
    public void   setId(String v)       { this.id = v; }

    public String getRegionCode()             { return regionCode; }
    public void   setRegionCode(String v)     { this.regionCode = v; }

    public String getRegionName()             { return regionName; }
    public void   setRegionName(String v)     { this.regionName = v; }

    public Double getLatitude()               { return latitude; }
    public void   setLatitude(Double v)       { this.latitude = v; }

    public Double getLongitude()              { return longitude; }
    public void   setLongitude(Double v)      { this.longitude = v; }

    public List<String> getVideoIds()         { return videoIds; }
    public void         setVideoIds(List<String> v) { this.videoIds = v; }

    public List<TrendingVideoData> getTopVideos()              { return topVideos; }
    public void                    setTopVideos(List<TrendingVideoData> v) { this.topVideos = v; }

    public LocalDateTime getUpdatedAt()             { return updatedAt; }
    public void          setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }

    // ── Embedded video snapshot ──────────────────────────────────────────────
    public static class TrendingVideoData {
        private String videoId;
        private String title;
        private String thumbnail;
        private String channelId;
        private String publishedAt;

        public TrendingVideoData() {}

        public String getVideoId()              { return videoId; }
        public void   setVideoId(String v)      { this.videoId = v; }

        public String getTitle()                { return title; }
        public void   setTitle(String v)        { this.title = v; }

        public String getThumbnail()            { return thumbnail; }
        public void   setThumbnail(String v)    { this.thumbnail = v; }

        public String getChannelId()            { return channelId; }
        public void   setChannelId(String v)    { this.channelId = v; }

        public String getPublishedAt()          { return publishedAt; }
        public void   setPublishedAt(String v)  { this.publishedAt = v; }
    }
}
