package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.PeakEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeakEventRepository extends JpaRepository<PeakEvent, Long> {

    List<PeakEvent> findByBuildingIdAndEventStatusInOrderByEventStartTimeAsc(
            Long buildingId, List<String> eventStatuses);
}
