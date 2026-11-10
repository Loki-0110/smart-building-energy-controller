package com.smartbuilding.energy.controller;
import com.smartbuilding.energy.entity.OccupancySchedule;
import com.smartbuilding.energy.service.OccupancyScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/occupancy-schedules")
public class OccupancyScheduleController {
    private final OccupancyScheduleService service;
    public OccupancyScheduleController(OccupancyScheduleService service) { this.service = service; }
    @GetMapping public List<OccupancySchedule> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public OccupancySchedule getById(@PathVariable Long id) { return service.getById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public OccupancySchedule create(@Valid @RequestBody OccupancySchedule item) { return service.create(item); }
    @PutMapping("/{id}") public OccupancySchedule update(@PathVariable Long id, @Valid @RequestBody OccupancySchedule item) { return service.update(id, item); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
