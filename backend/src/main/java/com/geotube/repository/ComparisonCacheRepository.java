package com.geotube.repository;

import com.geotube.model.ComparisonCache;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComparisonCacheRepository extends MongoRepository<ComparisonCache, String> {

    Optional<ComparisonCache> findByCacheKey(String cacheKey);
}
