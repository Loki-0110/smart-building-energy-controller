
package com.smartbuilding.energy.controller;

import com.smartbuilding.energy.entity.LoadSchedule;
import com.smartbuilding.energy.repository.LoadScheduleRepository;
import com.smartbuilding.energy.service.LoadScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/load-schedules")
public class LoadScheduleController {

    private final LoadScheduleRepository loadScheduleRepository;
    private final LoadScheduleService loadScheduleService;

    public LoadScheduleController(
            LoadScheduleRepository loadScheduleRepository,
            LoadScheduleService loadScheduleService) {
        this.loadScheduleRepository = loadScheduleRepository;
        this.loadScheduleService = loadScheduleService;
    }

    @GetMapping
    public List<LoadSchedule> getAllRecommendations() {
        return loadScheduleRepository.findAll();
    }

    @GetMapping("/event/{eventId}")
    public List<LoadSchedule> getRecommendationsByEvent(
            @PathVariable Long eventId) {
        return loadScheduleRepository.findByEventId(eventId);
    }

    @GetMapping("/pending")
    public List<LoadSchedule> getPendingRecommendations() {
        return loadScheduleRepository.findByScheduleStatus("PENDING");
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<LoadSchedule> getRecommendationById(
            @PathVariable Long scheduleId) {
        return loadScheduleRepository.findById(scheduleId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{scheduleId}/approve")
    public ResponseEntity<LoadSchedule> approveSchedule(
            @PathVariable Long scheduleId) {
        return ResponseEntity.ok(
                loadScheduleService.approveSchedule(scheduleId));
    }

    @PutMapping("/{scheduleId}/reject")
    public ResponseEntity<LoadSchedule> rejectSchedule(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, String> request) {

        String reason = request.get("reason");

        return ResponseEntity.ok(
                loadScheduleService.rejectSchedule(scheduleId, reason));
    }


    @PutMapping("/{scheduleId}/override")
    public ResponseEntity<LoadSchedule> overrideSchedule(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, Object> request) {

        Long userId = Long.valueOf(request.get("userId").toString());

        String newAction = request.get("newAction").toString();

        String reason = request.get("reason").toString();

        LoadSchedule updatedSchedule =
                loadScheduleService.overrideSchedule(
                        scheduleId, userId, newAction, reason);

        return ResponseEntity.ok(updatedSchedule);
    }

}
