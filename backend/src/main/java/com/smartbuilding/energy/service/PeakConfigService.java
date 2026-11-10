package com.smartbuilding.energy.service;
import com.smartbuilding.energy.entity.PeakConfig;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.PeakConfigRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class PeakConfigService {
    private final PeakConfigRepository repository;
    public PeakConfigService(PeakConfigRepository repository) { this.repository = repository; }
    public List<PeakConfig> getAll() { return repository.findAll(); }
    public PeakConfig getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PeakConfig not found with id: " + id));
    }
    public PeakConfig create(PeakConfig item) { item.setConfigId(null); return repository.save(item); }
    public PeakConfig update(Long id, PeakConfig item) { getById(id); item.setConfigId(id); return repository.save(item); }
    public void delete(Long id) { repository.delete(getById(id)); }
}
