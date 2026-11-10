USE smart_building_db;

START TRANSACTION;

-- 1. BUILDING
INSERT INTO BUILDING
(BUILDING_ID, BUILDING_NAME, LOCATION)
VALUES
(1, 'Smart Building - Chennai', 'Chennai, Tamil Nadu, India');


-- 2. APP_USERS
-- Demo-only BCrypt hash. Password for this sample hash: password
-- Replace with secure generated hashes before enabling authentication.
INSERT INTO APP_USERS
(USER_ID, USERNAME, PASSWORD_HASH, ROLE_NAME, IS_ACTIVE)
VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'ADMIN', TRUE),
(2, 'operator', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'OPERATOR', TRUE);


-- 3. LOAD_EQUIPMENT
INSERT INTO LOAD_EQUIPMENT
(EQUIPMENT_ID, BUILDING_ID, EQUIPMENT_NAME, EQUIPMENT_TYPE,
 PRIORITY_LEVEL, IS_CRITICAL, IS_CONTROLLABLE,
 RATED_POWER_KW, CURRENT_STATUS, AREA_NAME)
VALUES
(1, 1, 'Decorative Lighting', 'LIGHTING',
 'LOW', FALSE, TRUE, 10.00, 'ON', 'Lobby'),

(2, 1, 'Non-essential Plug Loads', 'ELECTRICAL',
 'LOW', FALSE, TRUE, 8.00, 'ON', 'Office'),

(3, 1, 'Conference Room AV', 'ELECTRICAL',
 'LOW', FALSE, TRUE, 3.00, 'ON', 'Conference Room'),

(4, 1, 'Cafeteria Exhaust Fan', 'FAN',
 'MEDIUM', FALSE, TRUE, 4.00, 'ON', 'Cafeteria'),

(5, 1, 'HVAC Zone A', 'HVAC',
 'HIGH', FALSE, TRUE, 40.00, 'ON', 'Office'),

(6, 1, 'Emergency Lighting', 'LIGHTING',
 'CRITICAL', TRUE, FALSE, 5.00, 'ON', 'Emergency Area'),

(7, 1, 'Server Rack', 'IT',
 'CRITICAL', TRUE, FALSE, 12.00, 'ON', 'Server Room'),

(8, 1, 'Elevator', 'ELEVATOR',
 'CRITICAL', TRUE, FALSE, 7.00, 'ON', 'Main Building');


-- 4. METER_READINGS
INSERT INTO METER_READINGS
(BUILDING_ID, READING_TIMESTAMP, DEMAND_KW,
 SOURCE_NAME, DATA_QUALITY_STATUS)
VALUES
(1, '2026-11-10 09:00:00', 175.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:05:00', 182.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:10:00', 195.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:15:00', 193.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:20:00', 188.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:25:00', 178.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:30:00', 176.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:35:00', 181.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:40:00', 186.00, 'SIMULATOR', 'VALID'),
(1, '2026-11-10 09:45:00', 179.00, 'SIMULATOR', 'VALID');


-- 5. OCCUPANCY_SCHEDULE
INSERT INTO OCCUPANCY_SCHEDULE
(BUILDING_ID, AREA_NAME, START_TIME, END_TIME,
 OCCUPANCY_STATUS, EXPECTED_OCCUPANCY)
VALUES
(1, 'Office', '2026-11-10 09:00:00',
 '2026-11-10 18:00:00', 'OCCUPIED', 40),

(1, 'Conference Room', '2026-11-10 09:00:00',
 '2026-11-10 11:00:00', 'OCCUPIED', 12),

(1, 'Cafeteria', '2026-11-10 09:00:00',
 '2026-11-10 11:00:00', 'UNOCCUPIED', 0),

(1, 'Lobby', '2026-11-10 09:00:00',
 '2026-11-10 18:00:00', 'OCCUPIED', 5);


-- 6. PEAK_CONFIG
INSERT INTO PEAK_CONFIG
(BUILDING_ID, PEAK_THRESHOLD_KW, CONFIG_START_TIME,
 CONFIG_END_TIME, IS_ACTIVE)
VALUES
(1, 180.00, '2026-11-10 00:00:00',
 '2026-11-10 23:59:59', TRUE);


-- 7. COMFORT_RULES
INSERT INTO COMFORT_RULES
(BUILDING_ID, AREA_NAME, MIN_TEMPERATURE,
 MAX_TEMPERATURE, MAX_ALLOWED_ADJUSTMENT, IS_ACTIVE)
VALUES
(1, 'Office', 22.00, 26.00, 1.50, TRUE),
(1, 'Conference Room', 22.00, 25.00, 1.00, TRUE);


-- 8. PEAK_EVENTS
INSERT INTO PEAK_EVENTS
(BUILDING_ID, EVENT_START_TIME, EVENT_END_TIME,
 PEAK_DEMAND_KW, THRESHOLD_KW, EVENT_STATUS)
VALUES
(1, '2026-11-10 09:10:00', NULL,
 195.00, 180.00, 'OPEN');


-- 9. LOAD_SCHEDULE
-- One evaluation per equipment item for this sample event.
INSERT INTO LOAD_SCHEDULE
(EVENT_ID, EQUIPMENT_ID, RECOMMENDED_ACTION,
 EXPECTED_REDUCTION_KW, SCHEDULE_STATUS, REASON)
VALUES
(1, 1, 'REDUCE', 10.00, 'PENDING',
 'Non-critical decorative lighting is eligible for simulated reduction.'),

(1, 2, 'REDUCE', 8.00, 'PENDING',
 'Non-essential plug loads are eligible for simulated reduction.'),

(1, 3, 'REDUCE', 3.00, 'PENDING',
 'Conference AV is non-critical and controllable; operator review required.'),

(1, 4, 'REDUCE', 4.00, 'PENDING',
 'Cafeteria is marked unoccupied in the sample schedule.'),

(1, 5, 'MAINTAIN', 0.00, 'REJECTED',
 'Office is occupied; HVAC action requires comfort and occupancy validation.'),

(1, 6, 'MAINTAIN', 0.00, 'EXCLUDED',
 'Critical emergency lighting is protected.'),

(1, 7, 'MAINTAIN', 0.00, 'EXCLUDED',
 'Critical server equipment is protected.'),

(1, 8, 'MAINTAIN', 0.00, 'EXCLUDED',
 'Critical elevator equipment is protected.');


-- 10. OVERRIDE_LOG
INSERT INTO OVERRIDE_LOG
(SCHEDULE_ID, USER_ID, ORIGINAL_ACTION, OVERRIDE_ACTION, OVERRIDE_REASON)
VALUES
(3, 2, 'REDUCE', 'MAINTAIN',
 'Sample operator override: conference room equipment must remain available.');


COMMIT;