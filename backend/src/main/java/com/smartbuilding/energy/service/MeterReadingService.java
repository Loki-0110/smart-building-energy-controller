package com.smartbuilding.energy.service;

import com.smartbuilding.energy.entity.MeterReading;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.MeterReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MeterReadingService {
    private final MeterReadingRepository repository;

    public MeterReadingService(MeterReadingRepository repository) {
        this.repository = repository;
    }

    public List<MeterReading> getAll() { return repository.findAll(); }

    public MeterReading getById(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("MeterReading not found with id: " + id));
    }

    /**
     * Idempotent ingestion: the database unique key is (building_id, reading_timestamp).
     * Re-sending the same reading returns the already stored row instead of failing the
     * entire Python ingestion batch with MySQL error 1062. INSERT IGNORE is atomic, so it
     * also handles two concurrent requests safely.
     */
    @Transactional
    public MeterReading create(MeterReading item) {
        item.setReadingId(null);
        if (item.getDataQualityStatus() == null || item.getDataQualityStatus().isBlank()) {
            item.setDataQualityStatus("VALID");
        }
        repository.insertIfAbsent(
                item.getBuildingId(),
                item.getReadingTimestamp(),
                item.getDemandKw(),
                item.getSourceName(),
                item.getDataQualityStatus());
        return repository.findByBuildingIdAndReadingTimestamp(
                        item.getBuildingId(), item.getReadingTimestamp())
                .orElseThrow(() -> new IllegalStateException(
                        "Meter reading insert did not create or find a row."));
    }

    @Transactional
    public MeterReading update(Long id, MeterReading item) {
        getById(id);
        item.setReadingId(id);
        return repository.save(item);
    }

    public void delete(Long id) { repository.delete(getById(id)); }
}
