package com.smartbuilding.energy.service;
import com.smartbuilding.energy.entity.MeterReading;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.MeterReadingRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class MeterReadingService {
    private final MeterReadingRepository repository;
    public MeterReadingService(MeterReadingRepository repository) { this.repository = repository; }
    public List<MeterReading> getAll() { return repository.findAll(); }
    public MeterReading getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("MeterReading not found with id: " + id));
    }
    public MeterReading create(MeterReading item) { item.setReadingId(null); return repository.save(item); }
    public MeterReading update(Long id, MeterReading item) { getById(id); item.setReadingId(id); return repository.save(item); }
    public void delete(Long id) { repository.delete(getById(id)); }
}
