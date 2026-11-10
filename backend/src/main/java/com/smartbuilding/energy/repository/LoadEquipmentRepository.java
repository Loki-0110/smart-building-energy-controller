
package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.LoadEquipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoadEquipmentRepository
        extends JpaRepository<LoadEquipment, Long> {

    List<LoadEquipment> findByBuildingId(Long buildingId);

    List<LoadEquipment> findByBuildingIdAndControllableTrueAndCriticalFalse(
            Long buildingId
    );
}
