package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.PeakProcessingState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeakProcessingStateRepository
        extends JpaRepository<PeakProcessingState, Long> {
}
