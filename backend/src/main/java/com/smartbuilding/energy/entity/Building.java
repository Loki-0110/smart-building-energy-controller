package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Size;

@Entity @Table(name="BUILDING")
public class Building {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="BUILDING_ID")
    private Long buildingId;
    @Size(max=100)
    @Column(name="BUILDING_NAME", length=100)
    private String buildingName;
    @Size(max=200)
    @Column(name="LOCATION", length=200)
    private String location;
    @Column(name="CREATED_AT", insertable=false, updatable=false)
    private java.time.LocalDateTime createdAt;

    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}