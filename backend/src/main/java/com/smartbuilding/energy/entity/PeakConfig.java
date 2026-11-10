package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

@Entity @Table(name="PEAK_CONFIG")
public class PeakConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="CONFIG_ID")
    private Long configId;
    @NotNull
    @Column(name="BUILDING_ID")
    private Long buildingId;
    @NotNull
    @DecimalMin("0.0")
    @Column(name="PEAK_THRESHOLD_KW", precision=12, scale=2)
    private java.math.BigDecimal peakThresholdKw;
    @Column(name="CONFIG_START_TIME")
    private java.time.LocalDateTime configStartTime;
    @Column(name="CONFIG_END_TIME")
    private java.time.LocalDateTime configEndTime;
    @Column(name="IS_ACTIVE")
    private Boolean active;

    public Long getConfigId() { return configId; }
    public void setConfigId(Long configId) { this.configId = configId; }
    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public BigDecimal getPeakThresholdKw() { return peakThresholdKw; }
    public void setPeakThresholdKw(BigDecimal peakThresholdKw) { this.peakThresholdKw = peakThresholdKw; }
    public LocalDateTime getConfigStartTime() { return configStartTime; }
    public void setConfigStartTime(LocalDateTime configStartTime) { this.configStartTime = configStartTime; }
    public LocalDateTime getConfigEndTime() { return configEndTime; }
    public void setConfigEndTime(LocalDateTime configEndTime) { this.configEndTime = configEndTime; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}