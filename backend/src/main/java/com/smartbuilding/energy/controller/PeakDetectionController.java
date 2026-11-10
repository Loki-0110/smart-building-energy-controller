
package com.smartbuilding.energy.controller;

import com.smartbuilding.energy.entity.PeakEvent;
import com.smartbuilding.energy.repository.PeakEventRepository;
import com.smartbuilding.energy.service.PeakDetectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PeakDetectionController {

    private final PeakDetectionService peakDetectionService;
    private final PeakEventRepository peakEventRepository;

    public PeakDetectionController(
            PeakDetectionService peakDetectionService,
            PeakEventRepository peakEventRepository) {

        this.peakDetectionService = peakDetectionService;
        this.peakEventRepository = peakEventRepository;
    }

    // Get all peak events
    @GetMapping("/peak-events")
    public List<PeakEvent> getAllPeakEvents() {
        return peakEventRepository.findAll();
    }

    // Existing peak detection API
    @PostMapping("/peak-detection/{buildingId}")
    public ResponseEntity<?> detectPeak(
            @PathVariable Long buildingId) {

        return peakDetectionService.detectPeak(buildingId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
