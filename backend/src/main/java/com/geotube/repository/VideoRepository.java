package com.geotube.repository;

import com.geotube.model.Video;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends MongoRepository<Video, String> {

    List<Video> findByQuery(String query);

    List<Video> findByQueryAndCountry(String query, String country);

    List<Video> findByQueryAndCity(String query, String city);

    boolean existsByQuery(String query);
}
