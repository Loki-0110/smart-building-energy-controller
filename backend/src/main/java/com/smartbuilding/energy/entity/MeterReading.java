package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

@Entity @Table(name="METER_READINGS")
public class MeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="READING_ID")
    private Long readingId;
    @NotNull
    @Column(name="BUILDING_ID")
    private Long buildingId;
    @NotNull
    @Column(name = "READING_TIMESTAMP")
    private LocalDateTime readingTimestamp;
    @NotNull
    @DecimalMin("0.0")
    @Column(name="DEMAND_KW", precision=12, scale=2)
    private java.math.BigDecimal demandKw;
    @Size(max=50)
    @Column(name="SOURCE_NAME", length=50)
    private String sourceName;
    @Size(max=30)
    @Column(name="DATA_QUALITY_STATUS", length=30)
    private String dataQualityStatus;
    @Column(name="CREATED_AT", insertable=false, updatable=false)
    private java.time.LocalDateTime createdAt;

    public Long getReadingId() { return readingId; }
    public void setReadingId(Long readingId) { this.readingId = readingId; }
    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public LocalDateTime getReadingTimestamp() { return readingTimestamp; }
    public void setReadingTimestamp(LocalDateTime readingTimestamp) { this.readingTimestamp = readingTimestamp; }
    public BigDecimal getDemandKw() { return demandKw; }
    public void setDemandKw(BigDecimal demandKw) { this.demandKw = demandKw; }
    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }
    public String getDataQualityStatus() { return dataQualityStatus; }
    public void setDataQualityStatus(String dataQualityStatus) { this.dataQualityStatus = dataQualityStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}