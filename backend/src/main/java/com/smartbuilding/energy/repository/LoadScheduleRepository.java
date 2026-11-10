
package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.LoadSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoadScheduleRepository
        extends JpaRepository<LoadSchedule, Long> {

    boolean existsByEventIdAndEquipmentId(
            Long eventId,
            Long equipmentId
    );
    List<LoadSchedule> findByScheduleStatus(String scheduleStatus);
    List<LoadSchedule> findByEventId(Long eventId);
}
