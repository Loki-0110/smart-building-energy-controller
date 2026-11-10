package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PEAK_PROCESSING_STATE")
public class PeakProcessingState {

    @Id
    @Column(name = "BUILDING_ID")
    private Long buildingId;

    @Column(name = "LAST_PROCESSED_READING_ID", nullable = false)
    private Long lastProcessedReadingId = 0L;

    @Column(name = "LAST_PROCESSED_AT")
    private LocalDateTime lastProcessedAt;

    @Column(name = "UPDATED_AT", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }
    public Long getLastProcessedReadingId() { return lastProcessedReadingId; }
    public void setLastProcessedReadingId(Long lastProcessedReadingId) {
        this.lastProcessedReadingId = lastProcessedReadingId;
    }
    public LocalDateTime getLastProcessedAt() { return lastProcessedAt; }
    public void setLastProcessedAt(LocalDateTime lastProcessedAt) {
        this.lastProcessedAt = lastProcessedAt;
    }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
