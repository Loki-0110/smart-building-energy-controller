package com.smartbuilding.energy.service;

import com.smartbuilding.energy.entity.MeterReading;
import com.smartbuilding.energy.entity.PeakConfig;
import com.smartbuilding.energy.entity.PeakEvent;
import com.smartbuilding.energy.entity.PeakProcessingState;
import com.smartbuilding.energy.repository.MeterReadingRepository;
import com.smartbuilding.energy.repository.PeakConfigRepository;
import com.smartbuilding.energy.repository.PeakEventRepository;
import com.smartbuilding.energy.repository.PeakProcessingStateRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class PeakDetectionService {

    private static final List<String> ACTIVE_STATUSES = List.of("DETECTED", "OPEN");
    private static final Duration RESOLUTION_DURATION = Duration.ofMinutes(5);
    private static final Duration MAX_READING_GAP = Duration.ofMinutes(2);

    private final MeterReadingRepository meterReadingRepository;
    private final PeakConfigRepository peakConfigRepository;
    private final PeakEventRepository peakEventRepository;
    private final PeakProcessingStateRepository processingStateRepository;
    private final EquipmentEligibilityService eligibilityService;

    public PeakDetectionService(
            MeterReadingRepository meterReadingRepository,
            PeakConfigRepository peakConfigRepository,
            PeakEventRepository peakEventRepository,
            PeakProcessingStateRepository processingStateRepository,
            EquipmentEligibilityService eligibilityService) {
        this.meterReadingRepository = meterReadingRepository;
        this.peakConfigRepository = peakConfigRepository;
        this.peakEventRepository = peakEventRepository;
        this.processingStateRepository = processingStateRepository;
        this.eligibilityService = eligibilityService;
    }

    /**
     * Establishes a starting cursor before the scheduler imports the next batch.
     * Existing historical readings are not replayed on first deployment.
     */
    @Transactional
    public void initializeProcessingState(Long buildingId) {
        if (processingStateRepository.existsById(buildingId)) {
            return;
        }
        PeakProcessingState state = new PeakProcessingState();
        state.setBuildingId(buildingId);
        state.setLastProcessedReadingId(
                meterReadingRepository.findMaximumReadingId(buildingId));
        state.setLastProcessedAt(LocalDateTime.now());
        processingStateRepository.save(state);
    }

    /**
     * Processes every valid reading inserted after the building's saved cursor.
     * Readings are processed chronologically; the cursor is advanced only after
     * all event updates and recommendation generation succeed.
     */
    @Transactional
    public Optional<PeakEvent> detectPeak(Long buildingId) {
        PeakProcessingState state = processingStateRepository.findById(buildingId)
                .orElseGet(() -> createInitialState(buildingId));

        List<MeterReading> pending = meterReadingRepository
                .findByBuildingIdAndReadingIdGreaterThanAndDataQualityStatus(
                        buildingId, state.getLastProcessedReadingId(), "VALID");

        if (pending.isEmpty()) {
            return Optional.empty();
        }

        pending.sort(Comparator
                .comparing(MeterReading::getReadingTimestamp)
                .thenComparing(MeterReading::getReadingId));

        List<PeakEvent> activeAtStart = peakEventRepository
                .findByBuildingIdAndEventStatusInOrderByEventStartTimeAsc(
                        buildingId, ACTIVE_STATUSES);

        if (activeAtStart.size() > 1) {
            throw new IllegalStateException(
                    "Building " + buildingId + " has " + activeAtStart.size()
                    + " active peak events. Reconcile legacy active events before processing."
            );
        }

        PeakEvent lastAffectedEvent = null;
        Long highestReadingId = state.getLastProcessedReadingId();

        for (MeterReading reading : pending) {
            Optional<PeakEvent> affected = processSingleReading(buildingId, reading);
            if (affected.isPresent()) {
                lastAffectedEvent = affected.get();
            }
            highestReadingId = Math.max(highestReadingId, reading.getReadingId());
        }

        state.setLastProcessedReadingId(highestReadingId);
        state.setLastProcessedAt(LocalDateTime.now());
        processingStateRepository.save(state);

        return Optional.ofNullable(lastAffectedEvent);
    }

    // Kept separate so one reading has one deterministic lifecycle transition.
    private Optional<PeakEvent> processSingleReading(Long buildingId, MeterReading reading) {
        List<PeakEvent> active = peakEventRepository
                .findByBuildingIdAndEventStatusInOrderByEventStartTimeAsc(
                        buildingId, ACTIVE_STATUSES);

        if (active.size() > 1) {
            throw new IllegalStateException(
                    "More than one active peak event exists for building " + buildingId);
        }

        if (!active.isEmpty()) {
            PeakEvent event = active.get(0);
            if (!reading.getReadingTimestamp().isAfter(event.getEventStartTime())) {
                return Optional.of(event);
            }

            BigDecimal demand = reading.getDemandKw();
            if (demand.compareTo(event.getThresholdKw()) > 0) {
                if (demand.compareTo(event.getPeakDemandKw()) > 0) {
                    event.setPeakDemandKw(demand);
                }
                event.setEventStatus("OPEN");
                return Optional.of(peakEventRepository.save(event));
            }

            Optional<LocalDateTime> lowPeriodStart =
                    findResolvedLowPeriodStart(buildingId, event, reading);
            if (lowPeriodStart.isPresent()) {
                event.setEventEndTime(lowPeriodStart.get());
                event.setEventStatus("RESOLVED");
                return Optional.of(peakEventRepository.save(event));
            }
            return Optional.of(event);
        }

        PeakConfig config = peakConfigRepository
                .findFirstByBuildingIdAndActiveTrue(buildingId)
                .orElse(null);

        if (config == null || config.getPeakThresholdKw() == null) {
            return Optional.empty();
        }

        LocalDateTime timestamp = reading.getReadingTimestamp();
        if (config.getConfigStartTime() != null
                && timestamp.isBefore(config.getConfigStartTime())) {
            return Optional.empty();
        }
        if (config.getConfigEndTime() != null
                && timestamp.isAfter(config.getConfigEndTime())) {
            return Optional.empty();
        }

        if (reading.getDemandKw().compareTo(config.getPeakThresholdKw()) <= 0) {
            return Optional.empty();
        }

        PeakEvent event = new PeakEvent();
        event.setBuildingId(buildingId);
        event.setEventStartTime(timestamp);
        event.setPeakDemandKw(reading.getDemandKw());
        event.setThresholdKw(config.getPeakThresholdKw());
        event.setEventStatus("DETECTED");

        PeakEvent saved = peakEventRepository.save(event);
        eligibilityService.generateRecommendations(saved);
        return Optional.of(saved);
    }

    private Optional<LocalDateTime> findResolvedLowPeriodStart(
            Long buildingId, PeakEvent event, MeterReading currentReading) {

        List<MeterReading> readings =
                meterReadingRepository
                        .findByBuildingIdAndDataQualityStatusAndReadingTimestampGreaterThanEqualAndReadingTimestampLessThanEqualOrderByReadingTimestampAscReadingIdAsc(
                                buildingId,
                                "VALID",
                                event.getEventStartTime(),
                                currentReading.getReadingTimestamp());

        LocalDateTime lowStart = null;
        LocalDateTime previousTime = null;

        for (MeterReading reading : readings) {
            LocalDateTime time = reading.getReadingTimestamp();
            if (reading.getDemandKw().compareTo(event.getThresholdKw()) > 0) {
                lowStart = null;
                previousTime = null;
                continue;
            }

            if (previousTime != null
                    && Duration.between(previousTime, time).compareTo(MAX_READING_GAP) > 0) {
                lowStart = null;
            }

            if (lowStart == null) {
                lowStart = time;
            }

            previousTime = time;

            if (Duration.between(lowStart, time).compareTo(RESOLUTION_DURATION) >= 0) {
                return Optional.of(lowStart);
            }
        }

        return Optional.empty();
    }

    private PeakProcessingState createInitialState(Long buildingId) {
        PeakProcessingState state = new PeakProcessingState();
        state.setBuildingId(buildingId);
        state.setLastProcessedReadingId(
                meterReadingRepository.findMaximumReadingId(buildingId));
        state.setLastProcessedAt(LocalDateTime.now());
        return processingStateRepository.save(state);
    }
}
