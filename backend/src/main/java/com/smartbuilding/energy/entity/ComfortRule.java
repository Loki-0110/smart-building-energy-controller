
package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "COMFORT_RULES")
public class ComfortRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RULE_ID")
    private Long ruleId;

    @Column(name = "BUILDING_ID", nullable = false)
    private Long buildingId;

    @Column(name = "AREA_NAME", length = 100)
    private String areaName;

    @Column(name = "MIN_TEMPERATURE", precision = 5, scale = 2)
    private BigDecimal minTemperature;

    @Column(name = "MAX_TEMPERATURE", precision = 5, scale = 2)
    private BigDecimal maxTemperature;

    @Column(name = "MAX_ALLOWED_ADJUSTMENT", precision = 5, scale = 2)
    private BigDecimal maxAllowedAdjustment;

    @Column(name = "IS_ACTIVE")
    private Boolean active;

    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public BigDecimal getMinTemperature() {
        return minTemperature;
    }

    public void setMinTemperature(BigDecimal minTemperature) {
        this.minTemperature = minTemperature;
    }

    public BigDecimal getMaxTemperature() {
        return maxTemperature;
    }

    public void setMaxTemperature(BigDecimal maxTemperature) {
        this.maxTemperature = maxTemperature;
    }

    public BigDecimal getMaxAllowedAdjustment() {
        return maxAllowedAdjustment;
    }

    public void setMaxAllowedAdjustment(BigDecimal maxAllowedAdjustment) {
        this.maxAllowedAdjustment = maxAllowedAdjustment;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
