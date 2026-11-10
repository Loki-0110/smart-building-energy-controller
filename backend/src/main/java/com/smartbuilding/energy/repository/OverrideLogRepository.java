
package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.OverrideLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OverrideLogRepository extends JpaRepository<OverrideLog, Long> {

    List<OverrideLog> findByScheduleId(Long scheduleId);

    List<OverrideLog> findByUserId(Long userId);
}
