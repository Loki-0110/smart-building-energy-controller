
package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.OccupancySchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OccupancyScheduleRepository
        extends JpaRepository<OccupancySchedule, Long> {

    List<OccupancySchedule> findByBuildingId(Long buildingId);

    List<OccupancySchedule> findByBuildingIdAndAreaName(
            Long buildingId,
            String areaName
    );
}
