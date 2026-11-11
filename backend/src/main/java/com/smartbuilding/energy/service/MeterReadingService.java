
package com.smartbuilding.energy.service;

import com.smartbuilding.energy.entity.MeterReading;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.MeterReadingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeterReadingService {

    private final MeterReadingRepository repository;

    public MeterReadingService(MeterReadingRepository repository) {
        this.repository = repository;
    }

    // Server-side pagination: newest readings first
    public Page<MeterReading> getAll(int page, int size) {

        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative.");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100."
            );
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "readingId")
        );

        return repository.findAll(pageable);
    }

    public MeterReading getById(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(
                        "MeterReading not found with id: " + id
                )
        );
    }

    /*
     * Idempotent ingestion:
     * The database unique key is (building_id, reading_timestamp).
     */
    @Transactional
    public MeterReading create(MeterReading item) {

        item.setReadingId(null);

        if (item.getDataQualityStatus() == null
                || item.getDataQualityStatus().isBlank()) {
            item.setDataQualityStatus("VALID");
        }

        repository.insertIfAbsent(
                item.getBuildingId(),
                item.getReadingTimestamp(),
                item.getDemandKw(),
                item.getSourceName(),
                item.getDataQualityStatus()
        );

        return repository.findByBuildingIdAndReadingTimestamp(
                        item.getBuildingId(),
                        item.getReadingTimestamp()
                )
                .orElseThrow(() -> new IllegalStateException(
                        "Meter reading insert did not create or find a row."
                ));
    }

    @Transactional
    public MeterReading update(Long id, MeterReading item) {
        getById(id);
        item.setReadingId(id);
        return repository.save(item);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }
}
