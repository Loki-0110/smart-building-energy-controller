
package com.smartbuilding.energy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartBuildingApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                SmartBuildingApplication.class, args);
    }
}
