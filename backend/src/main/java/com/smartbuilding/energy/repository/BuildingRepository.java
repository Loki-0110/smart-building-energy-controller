package com.smartbuilding.energy.repository;
import com.smartbuilding.energy.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BuildingRepository extends JpaRepository<Building, Long> {}
