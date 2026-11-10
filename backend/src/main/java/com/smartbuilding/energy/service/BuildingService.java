package com.smartbuilding.energy.service;
import com.smartbuilding.energy.entity.Building;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.BuildingRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class BuildingService {
    private final BuildingRepository repository;
    public BuildingService(BuildingRepository repository) { this.repository = repository; }
    public List<Building> getAll() { return repository.findAll(); }
    public Building getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));
    }
    public Building create(Building item) { item.setBuildingId(null); return repository.save(item); }
    public Building update(Long id, Building item) { getById(id); item.setBuildingId(id); return repository.save(item); }
    public void delete(Long id) { repository.delete(getById(id)); }
}
