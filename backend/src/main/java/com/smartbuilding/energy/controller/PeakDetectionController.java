
package com.smartbuilding.energy.controller;

import com.smartbuilding.energy.entity.PeakEvent;
import com.smartbuilding.energy.service.PeakDetectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/peak-detection")
public class PeakDetectionController {

    private final PeakDetectionService peakDetectionService;

    public PeakDetectionController(
            PeakDetectionService peakDetectionService) {
        this.peakDetectionService = peakDetectionService;
    }

    @PostMapping("/{buildingId}")
    public ResponseEntity<?> detectPeak(
            @PathVariable Long buildingId) {

        return peakDetectionService.detectPeak(buildingId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
