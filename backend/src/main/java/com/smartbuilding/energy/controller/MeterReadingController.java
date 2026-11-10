package com.smartbuilding.energy.controller;
import com.smartbuilding.energy.entity.MeterReading;
import com.smartbuilding.energy.service.MeterReadingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/meter-readings")
public class MeterReadingController {
    private final MeterReadingService service;
    public MeterReadingController(MeterReadingService service) { this.service = service; }
    @GetMapping public List<MeterReading> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public MeterReading getById(@PathVariable Long id) { return service.getById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public MeterReading create(@Valid @RequestBody MeterReading item) { return service.create(item); }
    @PutMapping("/{id}") public MeterReading update(@PathVariable Long id, @Valid @RequestBody MeterReading item) { return service.update(id, item); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
