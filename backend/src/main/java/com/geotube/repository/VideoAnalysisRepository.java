package com.geotube.repository;

import com.geotube.model.VideoAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoAnalysisRepository extends MongoRepository<VideoAnalysis, String> {

    List<VideoAnalysis> findByQueryAndCountry(String query, String country);

    Optional<VideoAnalysis> findByQueryAndCountryAndVideoId(String query, String country, String videoId);
}
