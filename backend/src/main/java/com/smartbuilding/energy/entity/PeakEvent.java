
package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(
        name = "PEAK_EVENTS",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_peak_event_building_start",
                        columnNames = {"BUILDING_ID", "EVENT_START_TIME"}
                )
        }
)
public class PeakEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EVENT_ID")
    private Long eventId;

    @Column(name = "BUILDING_ID", nullable = false)
    private Long buildingId;

    @Column(name = "EVENT_START_TIME", nullable = false)
    private LocalDateTime eventStartTime;

    @Column(name = "EVENT_END_TIME")
    private LocalDateTime eventEndTime;

    @Column(name = "PEAK_DEMAND_KW", nullable = false,
            precision = 10, scale = 2)
    private BigDecimal peakDemandKw;

    @Column(name = "THRESHOLD_KW", nullable = false,
            precision = 10, scale = 2)
    private BigDecimal thresholdKw;

    @Column(name = "EVENT_STATUS")
    private String eventStatus;

    public PeakEvent() {
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public LocalDateTime getEventStartTime() {
        return eventStartTime;
    }

    public void setEventStartTime(LocalDateTime eventStartTime) {
        this.eventStartTime = eventStartTime;
    }

    public LocalDateTime getEventEndTime() {
        return eventEndTime;
    }

    public void setEventEndTime(LocalDateTime eventEndTime) {
        this.eventEndTime = eventEndTime;
    }

    public BigDecimal getPeakDemandKw() {
        return peakDemandKw;
    }

    public void setPeakDemandKw(BigDecimal peakDemandKw) {
        this.peakDemandKw = peakDemandKw;
    }

    public BigDecimal getThresholdKw() {
        return thresholdKw;
    }

    public void setThresholdKw(BigDecimal thresholdKw) {
        this.thresholdKw = thresholdKw;
    }

    public String getEventStatus() {
        return eventStatus;
    }

    public void setEventStatus(String eventStatus) {
        this.eventStatus = eventStatus;
    }
}
