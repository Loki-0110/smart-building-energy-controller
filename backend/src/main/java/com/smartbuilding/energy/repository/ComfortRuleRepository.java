
package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.ComfortRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComfortRuleRepository
        extends JpaRepository<ComfortRule, Long> {

    List<ComfortRule> findByBuildingIdAndActiveTrue(Long buildingId);

    List<ComfortRule> findByBuildingIdAndAreaNameAndActiveTrue(
            Long buildingId,
            String areaName
    );
}
