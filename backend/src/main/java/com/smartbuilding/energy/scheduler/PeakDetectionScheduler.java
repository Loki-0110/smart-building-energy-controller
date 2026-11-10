package com.smartbuilding.energy.scheduler;

import com.smartbuilding.energy.entity.Building;
import com.smartbuilding.energy.repository.BuildingRepository;
import com.smartbuilding.energy.service.PeakDetectionService;
import com.smartbuilding.energy.service.PythonIngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.util.List;

@Component
@ConditionalOnProperty(name = "energy.scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class PeakDetectionScheduler {

    private static final Logger log = LoggerFactory.getLogger(PeakDetectionScheduler.class);
    private final BuildingRepository buildingRepository;
    private final PeakDetectionService peakDetectionService;
    private final PythonIngestionService pythonIngestionService;

    public PeakDetectionScheduler(
            BuildingRepository buildingRepository,
            PeakDetectionService peakDetectionService,
            PythonIngestionService pythonIngestionService) {
        this.buildingRepository = buildingRepository;
        this.peakDetectionService = peakDetectionService;
        this.pythonIngestionService = pythonIngestionService;
    }

    @Scheduled(
            fixedDelayString = "${energy.scheduler.fixed-delay:300000}",
            initialDelayString = "${energy.scheduler.initial-delay:30000}")
    public void runEnergyMonitoringCycle() {
        log.info("========== ENERGY MONITORING CYCLE STARTED ==========");
        try {
            // Establish cursors before ingestion so the first new batch is not skipped.
            List<Building> buildings = buildingRepository.findAll();
            for (Building building : buildings) {
                peakDetectionService.initializeProcessingState(building.getBuildingId());
            }

            pythonIngestionService.executePythonIngestion();

            for (Building building : buildings) {
                try {
                    log.info("Processing new readings for building ID: {}", building.getBuildingId());
                    peakDetectionService.detectPeak(building.getBuildingId());
                } catch (Exception e) {
                    log.error("Peak processing failed for building ID: {}", building.getBuildingId(), e);
                }
            }
        } catch (Exception e) {
            log.error("Energy monitoring cycle failed.", e);
        }
        log.info("========== ENERGY MONITORING CYCLE FINISHED ==========");
    }
}
