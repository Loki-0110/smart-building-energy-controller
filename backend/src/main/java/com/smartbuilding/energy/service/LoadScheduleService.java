
package com.smartbuilding.energy.service;

import com.smartbuilding.energy.entity.AppUser;
import com.smartbuilding.energy.entity.LoadSchedule;
import com.smartbuilding.energy.entity.OverrideLog;
import com.smartbuilding.energy.repository.AppUserRepository;
import com.smartbuilding.energy.repository.LoadScheduleRepository;
import com.smartbuilding.energy.repository.OverrideLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoadScheduleService {

    private final LoadScheduleRepository loadScheduleRepository;
    private final AppUserRepository appUserRepository;
    private final OverrideLogRepository overrideLogRepository;

    public LoadScheduleService(
            LoadScheduleRepository loadScheduleRepository,
            AppUserRepository appUserRepository,
            OverrideLogRepository overrideLogRepository) {

        this.loadScheduleRepository = loadScheduleRepository;
        this.appUserRepository = appUserRepository;
        this.overrideLogRepository = overrideLogRepository;
    }

    @Transactional
    public LoadSchedule approveSchedule(Long scheduleId) {

        LoadSchedule schedule = getSchedule(scheduleId);

        if (!"PENDING".equalsIgnoreCase(schedule.getScheduleStatus())) {
            throw new IllegalStateException(
                    "Only PENDING recommendations can be approved.");
        }

        schedule.setScheduleStatus("APPROVED");

        return loadScheduleRepository.save(schedule);
    }

    @Transactional
    public LoadSchedule rejectSchedule(Long scheduleId, String rejectionReason) {

        LoadSchedule schedule = getSchedule(scheduleId);

        if (!"PENDING".equalsIgnoreCase(schedule.getScheduleStatus())) {
            throw new IllegalStateException(
                    "Only PENDING recommendations can be rejected.");
        }

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        schedule.setScheduleStatus("REJECTED");
        schedule.setReason(rejectionReason);

        return loadScheduleRepository.save(schedule);
    }

    @Transactional
    public LoadSchedule overrideSchedule(
            Long scheduleId,
            Long userId,
            String newAction,
            String overrideReason) {

        LoadSchedule schedule = getSchedule(scheduleId);

        String currentStatus = schedule.getScheduleStatus();

        if (!"PENDING".equalsIgnoreCase(currentStatus)
                && !"APPROVED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException(
                    "Only PENDING or APPROVED recommendations can be overridden.");
        }

        if (newAction == null || newAction.trim().isEmpty()) {
            throw new IllegalArgumentException("Override action is required.");
        }

        if (overrideReason == null || overrideReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Override reason is required.");
        }

        String action = newAction.trim().toUpperCase();

        if (!action.equals("REDUCE") && !action.equals("MAINTAIN")) {
            throw new IllegalArgumentException(
                    "Override action must be REDUCE or MAINTAIN.");
        }

        AppUser operator = appUserRepository
                .findByUserIdAndActiveTrue(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found or inactive."));

        String role = operator.getRoleName();

        if (!"ADMIN".equalsIgnoreCase(role)
                && !"OPERATOR".equalsIgnoreCase(role)) {
            throw new IllegalArgumentException(
                    "Only ADMIN or OPERATOR can override recommendations.");
        }

        String originalAction = schedule.getRecommendedAction();

        OverrideLog log = new OverrideLog();
        log.setScheduleId(scheduleId);
        log.setUserId(userId);
        log.setOriginalAction(originalAction);
        log.setOverrideAction(action);
        log.setOverrideReason(overrideReason.trim());

        overrideLogRepository.save(log);

        schedule.setRecommendedAction(action);
        schedule.setScheduleStatus("OVERRIDDEN");
        schedule.setReason(overrideReason.trim());

        if ("MAINTAIN".equals(action)) {
            schedule.setExpectedReductionKw(
                    java.math.BigDecimal.ZERO);
        }

        return loadScheduleRepository.save(schedule);
    }

    private LoadSchedule getSchedule(Long scheduleId) {
        return loadScheduleRepository.findById(scheduleId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Load schedule not found: " + scheduleId));
    }
}
