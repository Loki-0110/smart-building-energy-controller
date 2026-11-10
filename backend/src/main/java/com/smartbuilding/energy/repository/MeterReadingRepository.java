package com.smartbuilding.energy.repository;
import com.smartbuilding.energy.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {}
