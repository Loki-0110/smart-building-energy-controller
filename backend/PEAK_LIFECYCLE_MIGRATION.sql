-- Run this once in smart_building_db before starting the updated backend.
-- It preserves all historical meter readings and peak-event rows.

CREATE TABLE IF NOT EXISTS PEAK_PROCESSING_STATE (
    BUILDING_ID BIGINT PRIMARY KEY,
    LAST_PROCESSED_READING_ID BIGINT NOT NULL DEFAULT 0,
    LAST_PROCESSED_AT DATETIME NULL,
    UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- Review the current events first.
SELECT EVENT_ID, BUILDING_ID, EVENT_START_TIME, EVENT_END_TIME,
       PEAK_DEMAND_KW, THRESHOLD_KW, EVENT_STATUS
FROM PEAK_EVENTS
WHERE BUILDING_ID = 1
ORDER BY EVENT_START_TIME;

-- These two rows are legacy test events from the earlier implementation.
-- They are NOT marked RESOLVED because we do not have proof of their end times.
-- LEGACY_REVIEW removes them from operational active-event processing while
-- retaining their full historical records for inspection.
UPDATE PEAK_EVENTS
SET EVENT_STATUS = 'LEGACY_REVIEW'
WHERE EVENT_ID IN (1, 2)
  AND EVENT_STATUS IN ('OPEN', 'DETECTED');

-- Start processing from the latest existing reading. New readings inserted
-- after this point will be processed by the scheduler.
INSERT INTO PEAK_PROCESSING_STATE
    (BUILDING_ID, LAST_PROCESSED_READING_ID, LAST_PROCESSED_AT)
SELECT 1, COALESCE(MAX(READING_ID), 0), NOW()
FROM METER_READINGS
WHERE BUILDING_ID = 1
ON DUPLICATE KEY UPDATE
    LAST_PROCESSED_READING_ID = VALUES(LAST_PROCESSED_READING_ID),
    LAST_PROCESSED_AT = VALUES(LAST_PROCESSED_AT);

-- Verify migration.
SELECT * FROM PEAK_PROCESSING_STATE WHERE BUILDING_ID = 1;
SELECT EVENT_ID, EVENT_STATUS, EVENT_START_TIME, EVENT_END_TIME
FROM PEAK_EVENTS WHERE BUILDING_ID = 1 ORDER BY EVENT_ID;
