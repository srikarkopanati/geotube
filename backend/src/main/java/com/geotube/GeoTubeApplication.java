package com.geotube;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class GeoTubeApplication {
    public static void main(String[] args) {
        SpringApplication.run(GeoTubeApplication.class, args);
    }
}
