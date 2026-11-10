
package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "LOAD_SCHEDULE")
public class LoadSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SCHEDULE_ID")
    private Long scheduleId;

    @Column(name = "EVENT_ID", nullable = false)
    private Long eventId;

    @Column(name = "EQUIPMENT_ID", nullable = false)
    private Long equipmentId;

    @Size(max = 50)
    @Column(name = "RECOMMENDED_ACTION", length = 50)
    private String recommendedAction;

    @Column(name = "EXPECTED_REDUCTION_KW", precision = 10, scale = 2)
    private BigDecimal expectedReductionKw;

    @Size(max = 30)
    @Column(name = "SCHEDULE_STATUS", length = 30)
    private String scheduleStatus;

    @Size(max = 255)
    @Column(name = "REASON", length = 255)
    private String reason;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public BigDecimal getExpectedReductionKw() {
        return expectedReductionKw;
    }

    public void setExpectedReductionKw(BigDecimal expectedReductionKw) {
        this.expectedReductionKw = expectedReductionKw;
    }

    public String getScheduleStatus() {
        return scheduleStatus;
    }

    public void setScheduleStatus(String scheduleStatus) {
        this.scheduleStatus = scheduleStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
