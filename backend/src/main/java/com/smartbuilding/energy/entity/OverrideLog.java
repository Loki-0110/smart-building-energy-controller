
package com.smartbuilding.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "OVERRIDE_LOG")
public class OverrideLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OVERRIDE_ID")
    private Long overrideId;

    @Column(name = "SCHEDULE_ID", nullable = false)
    private Long scheduleId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ORIGINAL_ACTION", nullable = false, length = 30)
    private String originalAction;

    @Column(name = "OVERRIDE_ACTION", nullable = false, length = 30)
    private String overrideAction;

    @Column(name = "OVERRIDE_REASON", length = 500)
    private String overrideReason;

    @Column(name = "OVERRIDE_TIMESTAMP", insertable = false, updatable = false)
    private LocalDateTime overrideTimestamp;

    public Long getOverrideId() {
        return overrideId;
    }

    public void setOverrideId(Long overrideId) {
        this.overrideId = overrideId;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getOriginalAction() {
        return originalAction;
    }

    public void setOriginalAction(String originalAction) {
        this.originalAction = originalAction;
    }

    public String getOverrideAction() {
        return overrideAction;
    }

    public void setOverrideAction(String overrideAction) {
        this.overrideAction = overrideAction;
    }

    public String getOverrideReason() {
        return overrideReason;
    }

    public void setOverrideReason(String overrideReason) {
        this.overrideReason = overrideReason;
    }

    public LocalDateTime getOverrideTimestamp() {
        return overrideTimestamp;
    }
}
