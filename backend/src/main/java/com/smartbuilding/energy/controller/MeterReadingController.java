
package com.smartbuilding.energy.controller;

import com.smartbuilding.energy.entity.MeterReading;
import com.smartbuilding.energy.service.MeterReadingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meter-readings")
public class MeterReadingController {

    private final MeterReadingService service;

    public MeterReadingController(MeterReadingService service) {
        this.service = service;
    }

    @GetMapping
    public Page<MeterReading> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getAll(page, size);
    }

    @GetMapping("/{id}")
    public MeterReading getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeterReading create(@Valid @RequestBody MeterReading item) {
        return service.create(item);
    }

    @PutMapping("/{id}")
    public MeterReading update(
            @PathVariable Long id,
            @Valid @RequestBody MeterReading item
    ) {
        return service.update(id, item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
