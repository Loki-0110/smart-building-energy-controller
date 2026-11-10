package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

    @Entity @Table(name="OCCUPANCY_SCHEDULE")
public class OccupancySchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="OCCUPANCY_ID")
    private Long occupancyId;
    @NotNull
    @Column(name="BUILDING_ID")
    private Long buildingId;
    @Size(max=100)
    @Column(name="AREA_NAME", length=100)
    private String areaName;
    @NotNull
    @Column(name="START_TIME")
    private java.time.LocalDateTime startTime;
    @NotNull
    @Column(name="END_TIME")
    private java.time.LocalDateTime endTime;
    @Size(max=30)
    @Column(name="OCCUPANCY_STATUS", length=30)
    private String occupancyStatus;
    @Column(name="EXPECTED_OCCUPANCY")
    private Integer expectedOccupancy;

    public Long getOccupancyId() { return occupancyId; }
    public void setOccupancyId(Long occupancyId) { this.occupancyId = occupancyId; }
    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getOccupancyStatus() { return occupancyStatus; }
    public void setOccupancyStatus(String occupancyStatus) { this.occupancyStatus = occupancyStatus; }
    public Integer getExpectedOccupancy() { return expectedOccupancy; }
    public void setExpectedOccupancy(Integer expectedOccupancy) { this.expectedOccupancy = expectedOccupancy; }
}