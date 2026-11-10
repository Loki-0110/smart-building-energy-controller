package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {

    Optional<MeterReading>
    findTopByBuildingIdAndDataQualityStatusOrderByReadingTimestampDesc(
            Long buildingId, String dataQualityStatus);

    List<MeterReading>
    findByBuildingIdAndDataQualityStatusAndReadingTimestampGreaterThanEqualAndReadingTimestampLessThanEqualOrderByReadingTimestampAscReadingIdAsc(
            Long buildingId,
            String dataQualityStatus,
            LocalDateTime from,
            LocalDateTime to);

    List<MeterReading>
    findByBuildingIdAndReadingIdGreaterThanAndDataQualityStatus(
            Long buildingId,
            Long readingId,
            String dataQualityStatus);

    @org.springframework.data.jpa.repository.Query(
            "select coalesce(max(m.readingId), 0) from MeterReading m where m.buildingId = :buildingId")
    Long findMaximumReadingId(@org.springframework.data.repository.query.Param("buildingId") Long buildingId);
}
