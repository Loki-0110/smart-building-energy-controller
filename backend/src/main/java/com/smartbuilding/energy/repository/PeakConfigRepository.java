
package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.PeakConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PeakConfigRepository
        extends JpaRepository<PeakConfig, Long> {

    Optional<PeakConfig> findFirstByBuildingIdAndActiveTrue(
            Long buildingId
    );
}
