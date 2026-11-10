package com.smartbuilding.energy.controller;
import com.smartbuilding.energy.entity.Building;
import com.smartbuilding.energy.service.BuildingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/buildings")
public class BuildingController {
    private final BuildingService service;
    public BuildingController(BuildingService service) { this.service = service; }
    @GetMapping public List<Building> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public Building getById(@PathVariable Long id) { return service.getById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Building create(@Valid @RequestBody Building item) { return service.create(item); }
    @PutMapping("/{id}") public Building update(@PathVariable Long id, @Valid @RequestBody Building item) { return service.update(id, item); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
