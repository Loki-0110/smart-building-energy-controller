package com.smartbuilding.energy.service;
import com.smartbuilding.energy.entity.OccupancySchedule;
import com.smartbuilding.energy.exception.ResourceNotFoundException;
import com.smartbuilding.energy.repository.OccupancyScheduleRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class OccupancyScheduleService {
    private final OccupancyScheduleRepository repository;
    public OccupancyScheduleService(OccupancyScheduleRepository repository) { this.repository = repository; }
    public List<OccupancySchedule> getAll() { return repository.findAll(); }
    public OccupancySchedule getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("OccupancySchedule not found with id: " + id));
    }
    public OccupancySchedule create(OccupancySchedule item) { item.setOccupancyId(null); return repository.save(item); }
    public OccupancySchedule update(Long id, OccupancySchedule item) { getById(id); item.setOccupancyId(id); return repository.save(item); }
    public void delete(Long id) { repository.delete(getById(id)); }
}
