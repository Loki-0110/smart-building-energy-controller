package com.smartbuilding.energy.controller;
import com.smartbuilding.energy.entity.PeakConfig;
import com.smartbuilding.energy.service.PeakConfigService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/peak-configs")
public class PeakConfigController {
    private final PeakConfigService service;
    public PeakConfigController(PeakConfigService service) { this.service = service; }
    @GetMapping public List<PeakConfig> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public PeakConfig getById(@PathVariable Long id) { return service.getById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public PeakConfig create(@Valid @RequestBody PeakConfig item) { return service.create(item); }
    @PutMapping("/{id}") public PeakConfig update(@PathVariable Long id, @Valid @RequestBody PeakConfig item) { return service.update(id, item); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
