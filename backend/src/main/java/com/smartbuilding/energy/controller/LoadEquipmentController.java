package com.smartbuilding.energy.controller;
import com.smartbuilding.energy.entity.LoadEquipment;
import com.smartbuilding.energy.service.LoadEquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/equipment")
public class LoadEquipmentController {
    private final LoadEquipmentService service;
    public LoadEquipmentController(LoadEquipmentService service) { this.service = service; }
    @GetMapping public List<LoadEquipment> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public LoadEquipment getById(@PathVariable Long id) { return service.getById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public LoadEquipment create(@Valid @RequestBody LoadEquipment item) { return service.create(item); }
    @PutMapping("/{id}") public LoadEquipment update(@PathVariable Long id, @Valid @RequestBody LoadEquipment item) { return service.update(id, item); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
