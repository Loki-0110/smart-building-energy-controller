
package com.smartbuilding.energy.service;

import com.smartbuilding.energy.entity.*;
import com.smartbuilding.energy.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EquipmentEligibilityService {

    private final LoadEquipmentRepository equipmentRepository;
    private final OccupancyScheduleRepository occupancyRepository;
    private final ComfortRuleRepository comfortRuleRepository;
    private final LoadScheduleRepository loadScheduleRepository;

    public EquipmentEligibilityService(
            LoadEquipmentRepository equipmentRepository,
            OccupancyScheduleRepository occupancyRepository,
            ComfortRuleRepository comfortRuleRepository,
            LoadScheduleRepository loadScheduleRepository) {

        this.equipmentRepository = equipmentRepository;
        this.occupancyRepository = occupancyRepository;
        this.comfortRuleRepository = comfortRuleRepository;
        this.loadScheduleRepository = loadScheduleRepository;
    }

    @Transactional
    public List<LoadSchedule> generateRecommendations(PeakEvent event) {

        Long buildingId = event.getBuildingId();
        LocalDateTime eventTime = event.getEventStartTime();

        List<LoadEquipment> equipmentList =
                equipmentRepository.findByBuildingId(buildingId);

        for (LoadEquipment equipment : equipmentList) {

            // Prevent duplicate records
            if (loadScheduleRepository.existsByEventIdAndEquipmentId(
                    event.getEventId(), equipment.getEquipmentId())) {
                continue;
            }

            String action = "MAINTAIN";
            String status = "EXCLUDED";
            String reason = "";

            // 1. Critical equipment protection
            if (Boolean.TRUE.equals(equipment.getCritical())) {

                reason = "Critical equipment is protected.";

            }
            // 2. Controllability check
            else if (!Boolean.TRUE.equals(equipment.getControllable())) {

                reason = "Equipment is not controllable.";

            }
            // 3. Equipment availability
            else if (!"ON".equalsIgnoreCase(
                    equipment.getCurrentStatus())) {

                reason = "Equipment is not currently switched ON.";

            }
            // 4. Occupancy check
            else if (isOccupied(buildingId, equipment, eventTime)) {

                status = "REJECTED";
                reason = "Area is occupied; reduction is not recommended.";

            }
            // 5. HVAC comfort protection
            else if (isHvac(equipment.getEquipmentType())) {

                List<ComfortRule> rules =
                        comfortRuleRepository
                                .findByBuildingIdAndAreaNameAndActiveTrue(
                                        buildingId,
                                        equipment.getAreaName());

                status = "REJECTED";
                reason = rules.isEmpty()
                        ? "No active comfort rule found."
                        : "Current temperature is unavailable; HVAC reduction requires validation.";

            }
            // 6. Power reduction validation
            else if (equipment.getRatedPowerKw() == null
                    || equipment.getRatedPowerKw()
                    .compareTo(BigDecimal.ZERO) <= 0) {

                reason = "Valid rated power is unavailable.";

            }
            // 7. Eligible equipment
            else {

                action = "REDUCE";
                status = "PENDING";

                reason = "Non-critical controllable equipment is eligible "
                        + "for simulated reduction; operator approval required.";
            }

            // 8. Save recommendation or exclusion
            LoadSchedule schedule = new LoadSchedule();

            schedule.setEventId(event.getEventId());
            schedule.setEquipmentId(equipment.getEquipmentId());
            schedule.setRecommendedAction(action);
            schedule.setScheduleStatus(status);
            schedule.setReason(reason);

            BigDecimal reduction = "REDUCE".equals(action)
                    ? equipment.getRatedPowerKw()
                    : BigDecimal.ZERO;

            schedule.setExpectedReductionKw(reduction);
            schedule.setCreatedAt(LocalDateTime.now());

            loadScheduleRepository.save(schedule);
        }

        return loadScheduleRepository.findByEventId(event.getEventId());
    }

    private boolean isOccupied(
            Long buildingId,
            LoadEquipment equipment,
            LocalDateTime eventTime) {

        if (eventTime == null || equipment.getAreaName() == null) {
            return true; // Fail safely when occupancy is unknown
        }

        List<OccupancySchedule> schedules =
                occupancyRepository.findByBuildingIdAndAreaName(
                        buildingId,
                        equipment.getAreaName());

        // Unknown occupancy is treated conservatively
        if (schedules.isEmpty()) {
            return true;
        }

        return schedules.stream().anyMatch(schedule ->
                schedule.getStartTime() != null
                        && schedule.getEndTime() != null
                        && !eventTime.isBefore(schedule.getStartTime())
                        && eventTime.isBefore(schedule.getEndTime())
                        && !"UNOCCUPIED".equalsIgnoreCase(
                        schedule.getOccupancyStatus())
        );
    }

    private boolean isHvac(String equipmentType) {

        if (equipmentType == null) {
            return false;
        }

        String type = equipmentType.toUpperCase();

        return type.contains("HVAC")
                || type.contains("AC")
                || type.contains("AIR");
    }
}
