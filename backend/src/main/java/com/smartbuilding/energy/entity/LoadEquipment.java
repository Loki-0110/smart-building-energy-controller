package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

@Entity @Table(name="LOAD_EQUIPMENT")
public class LoadEquipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="EQUIPMENT_ID")
    private Long equipmentId;
    @NotNull
    @Column(name="BUILDING_ID")
    private Long buildingId;
    @Size(max=100)
    @Column(name="EQUIPMENT_NAME", length=100)
    private String equipmentName;
    @Size(max=50)
    @Column(name="EQUIPMENT_TYPE", length=50)
    private String equipmentType;
    @Size(max=20)
    @Column(name="PRIORITY_LEVEL", length=20)
    private String priorityLevel;
    @Column(name="IS_CRITICAL")
    private Boolean critical;
    @Column(name="IS_CONTROLLABLE")
    private Boolean controllable;
    @DecimalMin("0.0")
    @Column(name="RATED_POWER_KW", precision=12, scale=2)
    private java.math.BigDecimal ratedPowerKw;
    @Size(max=30)
    @Column(name="CURRENT_STATUS", length=30)
    private String currentStatus;
    @Size(max=100)
    @Column(name="AREA_NAME", length=100)
    private String areaName;

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getEquipmentType() { return equipmentType; }
    public void setEquipmentType(String equipmentType) { this.equipmentType = equipmentType; }
    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }
    public Boolean getCritical() { return critical; }
    public void setCritical(Boolean critical) { this.critical = critical; }
    public Boolean getControllable() { return controllable; }
    public void setControllable(Boolean controllable) { this.controllable = controllable; }
    public BigDecimal getRatedPowerKw() { return ratedPowerKw; }
    public void setRatedPowerKw(BigDecimal ratedPowerKw) { this.ratedPowerKw = ratedPowerKw; }
    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }
}