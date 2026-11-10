-- =====================================================================
-- Smart Building Energy Peak-Shaving Controller
-- File     : database/mysql_schema.sql
-- Stage    : 2 - Database Development
-- Source   : Project documentation, Section 8 (MySQL Database Design)
-- Target   : MySQL 8.0.16 or later (CHECK constraints are enforced from 8.0.16)
-- Purpose  : Creates the database, the 10 core tables, foreign keys,
--            constraints and indexes.
-- Re-run   : Safe to re-run (CREATE ... IF NOT EXISTS). To rebuild from
--            scratch in a DEV database use database/mysql_reset_dev_only.sql
-- Notes    : * Every deviation from Section 8 is listed in
--              documentation/DATABASE_DESIGN.md (section "Deviations").
--            * This is a SIMULATION database. Nothing here controls
--              physical equipment.
--            * Timestamps are stored in UTC (documentation Section 8.4).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS smart_building_db
    CHARACTER SET utf8mb4;

USE smart_building_db;

-- ---------------------------------------------------------------------
-- 1. BUILDING : master record of a building
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS BUILDING (
    BUILDING_ID     BIGINT        NOT NULL AUTO_INCREMENT,
    BUILDING_NAME   VARCHAR(100)  NOT NULL,
    LOCATION        VARCHAR(200)  NULL,
    CREATED_AT      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (BUILDING_ID),
    CONSTRAINT uq_building_name UNIQUE (BUILDING_NAME)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 2. APP_USERS : application users and their roles (ADMIN/OPERATOR/VIEWER)
--    Created before OVERRIDE_LOG because OVERRIDE_LOG references it.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS APP_USERS (
    USER_ID         BIGINT        NOT NULL AUTO_INCREMENT,
    USERNAME        VARCHAR(100)  NOT NULL,
    PASSWORD_HASH   VARCHAR(255)  NOT NULL,          -- BCrypt hash only, never plain text
    ROLE_NAME       VARCHAR(30)   NOT NULL,
    IS_ACTIVE       BOOLEAN       NOT NULL DEFAULT TRUE,
    CREATED_AT      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (USER_ID),
    CONSTRAINT uq_app_users_username UNIQUE (USERNAME),
    CONSTRAINT ck_app_users_role CHECK (ROLE_NAME IN ('ADMIN', 'OPERATOR', 'VIEWER'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 3. LOAD_EQUIPMENT : electrical loads and their scheduling permissions
--    IS_CRITICAL / IS_CONTROLLABLE are NOT NULL and default to the SAFE
--    value (FALSE) so an unclassified item is never treated as reducible.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS LOAD_EQUIPMENT (
    EQUIPMENT_ID     BIGINT         NOT NULL AUTO_INCREMENT,
    BUILDING_ID      BIGINT         NOT NULL,
    EQUIPMENT_NAME   VARCHAR(100)   NOT NULL,
    EQUIPMENT_TYPE   VARCHAR(50)    NULL,
    PRIORITY_LEVEL   VARCHAR(20)    NOT NULL,
    IS_CRITICAL      BOOLEAN        NOT NULL DEFAULT FALSE,
    IS_CONTROLLABLE  BOOLEAN        NOT NULL DEFAULT FALSE,
    RATED_POWER_KW   DECIMAL(10,2)  NOT NULL,
    CURRENT_STATUS   VARCHAR(30)    NULL,
    AREA_NAME        VARCHAR(100)   NULL,
    PRIMARY KEY (EQUIPMENT_ID),
    INDEX idx_equipment_building (BUILDING_ID),
    CONSTRAINT fk_equipment_building FOREIGN KEY (BUILDING_ID)
        REFERENCES BUILDING (BUILDING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_equipment_rated_power CHECK (RATED_POWER_KW >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 4. METER_READINGS : simulated meter readings with a data-quality flag
--    UNIQUE (BUILDING_ID, READING_TIMESTAMP) makes ingestion retry-safe
--    and also serves as the (building, time) lookup index.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS METER_READINGS (
    READING_ID           BIGINT         NOT NULL AUTO_INCREMENT,
    BUILDING_ID          BIGINT         NOT NULL,
    READING_TIMESTAMP    DATETIME       NOT NULL,
    DEMAND_KW            DECIMAL(12,2)  NOT NULL,
    SOURCE_NAME          VARCHAR(50)    NULL,
    DATA_QUALITY_STATUS  VARCHAR(30)    NOT NULL,
    CREATED_AT           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (READING_ID),
    CONSTRAINT uq_meter_building_timestamp UNIQUE (BUILDING_ID, READING_TIMESTAMP),
    INDEX idx_meter_quality_time (BUILDING_ID, DATA_QUALITY_STATUS, READING_TIMESTAMP),
    CONSTRAINT fk_meter_building FOREIGN KEY (BUILDING_ID)
        REFERENCES BUILDING (BUILDING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 5. OCCUPANCY_SCHEDULE : occupancy windows per building area
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS OCCUPANCY_SCHEDULE (
    OCCUPANCY_ID        BIGINT        NOT NULL AUTO_INCREMENT,
    BUILDING_ID         BIGINT        NOT NULL,
    AREA_NAME           VARCHAR(100)  NOT NULL,
    START_TIME          DATETIME      NOT NULL,
    END_TIME            DATETIME      NOT NULL,
    OCCUPANCY_STATUS    VARCHAR(30)   NOT NULL,
    EXPECTED_OCCUPANCY  INT           NULL,
    PRIMARY KEY (OCCUPANCY_ID),
    INDEX idx_occupancy_lookup (BUILDING_ID, AREA_NAME, START_TIME, END_TIME),
    CONSTRAINT fk_occupancy_building FOREIGN KEY (BUILDING_ID)
        REFERENCES BUILDING (BUILDING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_occupancy_window CHECK (END_TIME > START_TIME),
    CONSTRAINT ck_occupancy_expected CHECK (EXPECTED_OCCUPANCY IS NULL OR EXPECTED_OCCUPANCY >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 6. PEAK_CONFIG : configurable peak-demand threshold
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PEAK_CONFIG (
    CONFIG_ID          BIGINT         NOT NULL AUTO_INCREMENT,
    BUILDING_ID        BIGINT         NOT NULL,
    PEAK_THRESHOLD_KW  DECIMAL(12,2)  NOT NULL,
    CONFIG_START_TIME  DATETIME       NULL,
    CONFIG_END_TIME    DATETIME       NULL,
    IS_ACTIVE          BOOLEAN        NOT NULL DEFAULT TRUE,
    PRIMARY KEY (CONFIG_ID),
    INDEX idx_peak_config_active (BUILDING_ID, IS_ACTIVE),
    CONSTRAINT fk_peak_config_building FOREIGN KEY (BUILDING_ID)
        REFERENCES BUILDING (BUILDING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_peak_config_threshold CHECK (PEAK_THRESHOLD_KW > 0),
    CONSTRAINT ck_peak_config_window CHECK (
        CONFIG_START_TIME IS NULL OR CONFIG_END_TIME IS NULL OR CONFIG_END_TIME > CONFIG_START_TIME)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 7. COMFORT_RULES : temperature limits and maximum HVAC adjustment
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS COMFORT_RULES (
    RULE_ID                 BIGINT        NOT NULL AUTO_INCREMENT,
    BUILDING_ID             BIGINT        NOT NULL,
    AREA_NAME               VARCHAR(100)  NULL,
    MIN_TEMPERATURE         DECIMAL(5,2)  NULL,
    MAX_TEMPERATURE         DECIMAL(5,2)  NULL,
    MAX_ALLOWED_ADJUSTMENT  DECIMAL(5,2)  NULL,
    IS_ACTIVE               BOOLEAN       NOT NULL DEFAULT TRUE,
    PRIMARY KEY (RULE_ID),
    INDEX idx_comfort_lookup (BUILDING_ID, AREA_NAME, IS_ACTIVE),
    CONSTRAINT fk_comfort_building FOREIGN KEY (BUILDING_ID)
        REFERENCES BUILDING (BUILDING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_comfort_temperature CHECK (
        MIN_TEMPERATURE IS NULL OR MAX_TEMPERATURE IS NULL OR MIN_TEMPERATURE < MAX_TEMPERATURE),
    CONSTRAINT ck_comfort_adjustment CHECK (
        MAX_ALLOWED_ADJUSTMENT IS NULL OR MAX_ALLOWED_ADJUSTMENT >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 8. PEAK_EVENTS : detected peak-demand events
--    UNIQUE (BUILDING_ID, EVENT_START_TIME) is the database-level guard
--    against duplicate events for the same detection window
--    (documentation Section 27.5) and also serves as the
--    (building, start time) lookup index.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PEAK_EVENTS (
    EVENT_ID          BIGINT         NOT NULL AUTO_INCREMENT,
    BUILDING_ID       BIGINT         NOT NULL,
    EVENT_START_TIME  DATETIME       NOT NULL,
    EVENT_END_TIME    DATETIME       NULL,
    PEAK_DEMAND_KW    DECIMAL(12,2)  NULL,
    THRESHOLD_KW      DECIMAL(12,2)  NULL,
    EVENT_STATUS      VARCHAR(30)    NOT NULL,
    PRIMARY KEY (EVENT_ID),
    CONSTRAINT uq_peak_event_building_start UNIQUE (BUILDING_ID, EVENT_START_TIME),
    CONSTRAINT fk_peak_event_building FOREIGN KEY (BUILDING_ID)
        REFERENCES BUILDING (BUILDING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_peak_event_window CHECK (
        EVENT_END_TIME IS NULL OR EVENT_END_TIME >= EVENT_START_TIME)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 9. LOAD_SCHEDULE : one evaluated equipment item per peak event
--    (accepted AND rejected candidates, each with a REASON - Rule 6).
--    UNIQUE (EVENT_ID, EQUIPMENT_ID) stops repeated scheduler runs from
--    creating duplicate schedule rows for the same event.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS LOAD_SCHEDULE (
    SCHEDULE_ID            BIGINT         NOT NULL AUTO_INCREMENT,
    EVENT_ID               BIGINT         NOT NULL,
    EQUIPMENT_ID           BIGINT         NOT NULL,
    RECOMMENDED_ACTION     VARCHAR(30)    NOT NULL,
    EXPECTED_REDUCTION_KW  DECIMAL(10,2)  NOT NULL,
    SCHEDULE_STATUS        VARCHAR(30)    NOT NULL,
    REASON                 VARCHAR(500)   NOT NULL,
    CREATED_AT             TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (SCHEDULE_ID),
    CONSTRAINT uq_schedule_event_equipment UNIQUE (EVENT_ID, EQUIPMENT_ID),
    INDEX idx_schedule_event (EVENT_ID),
    CONSTRAINT fk_schedule_event FOREIGN KEY (EVENT_ID)
        REFERENCES PEAK_EVENTS (EVENT_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_schedule_equipment FOREIGN KEY (EQUIPMENT_ID)
        REFERENCES LOAD_EQUIPMENT (EQUIPMENT_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_schedule_reduction CHECK (EXPECTED_REDUCTION_KW >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 10. OVERRIDE_LOG : append-only audit history of operator decisions
--     ON DELETE RESTRICT means a schedule or user that has audit
--     history cannot be deleted ("do not delete override history").
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS OVERRIDE_LOG (
    OVERRIDE_ID         BIGINT        NOT NULL AUTO_INCREMENT,
    SCHEDULE_ID         BIGINT        NOT NULL,
    USER_ID             BIGINT        NOT NULL,
    ORIGINAL_ACTION     VARCHAR(30)   NOT NULL,
    OVERRIDE_ACTION     VARCHAR(30)   NOT NULL,
    OVERRIDE_REASON     VARCHAR(500)  NULL,
    OVERRIDE_TIMESTAMP  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (OVERRIDE_ID),
    INDEX idx_override_schedule (SCHEDULE_ID),
    INDEX idx_override_user_time (USER_ID, OVERRIDE_TIMESTAMP),
    CONSTRAINT fk_override_schedule FOREIGN KEY (SCHEDULE_ID)
        REFERENCES LOAD_SCHEDULE (SCHEDULE_ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_override_user FOREIGN KEY (USER_ID)
        REFERENCES APP_USERS (USER_ID) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- End of schema. Next: run database/mysql_sample_data.sql
