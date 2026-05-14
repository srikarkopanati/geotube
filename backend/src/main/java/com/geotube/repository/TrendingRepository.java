package com.geotube.repository;

import com.geotube.model.TrendingData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrendingRepository extends MongoRepository<TrendingData, String> {
    Optional<TrendingData> findByRegionCode(String regionCode);
}
