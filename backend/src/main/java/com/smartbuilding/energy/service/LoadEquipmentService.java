package com.smartbuilding.energy.service;
import com.smartbuilding.energy.entity.LoadEquipment;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.LoadEquipmentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class LoadEquipmentService {
    private final LoadEquipmentRepository repository;
    public LoadEquipmentService(LoadEquipmentRepository repository) { this.repository = repository; }
    public List<LoadEquipment> getAll() { return repository.findAll(); }
    public LoadEquipment getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("LoadEquipment not found with id: " + id));
    }
    public LoadEquipment create(LoadEquipment item) { item.setEquipmentId(null); return repository.save(item); }
    public LoadEquipment update(Long id, LoadEquipment item) { getById(id); item.setEquipmentId(id); return repository.save(item); }
    public void delete(Long id) { repository.delete(getById(id)); }
}
