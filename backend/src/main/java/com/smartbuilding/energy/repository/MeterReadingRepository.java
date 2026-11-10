package com.smartbuilding.energy.repository;

import com.smartbuilding.energy.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {


    Optional<MeterReading> findByBuildingIdAndReadingTimestamp(
            Long buildingId, LocalDateTime readingTimestamp);

    /** Atomic MySQL insert that ignores an already-seen building/timestamp pair. */
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO METER_READINGS " +
            "(BUILDING_ID, READING_TIMESTAMP, DEMAND_KW, SOURCE_NAME, DATA_QUALITY_STATUS) " +
            "VALUES (:buildingId, :readingTimestamp, :demandKw, :sourceName, :dataQualityStatus)",
            nativeQuery = true)
    int insertIfAbsent(
            @Param("buildingId") Long buildingId,
            @Param("readingTimestamp") LocalDateTime readingTimestamp,
            @Param("demandKw") java.math.BigDecimal demandKw,
            @Param("sourceName") String sourceName,
            @Param("dataQualityStatus") String dataQualityStatus);

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
