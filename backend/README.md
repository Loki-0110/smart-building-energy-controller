# Smart Building Energy Controller — Backend Update

## What changed

- Added `PEAK_PROCESSING_STATE` to persist the last processed meter-reading ID for each building.
- The scheduler initializes the processing cursor before Python ingestion, so existing historical readings are not replayed and the first newly ingested batch is not skipped.
- Peak detection processes every new `VALID` reading in timestamp order, rather than checking only the latest reading.
- One operational active event (`DETECTED` or `OPEN`) is allowed per building. If legacy data contains multiple active events, processing stops with a clear error rather than silently ignoring events.
- A continuing peak updates the same event's maximum demand.
- A below-threshold sequence resolves an event only after at least five minutes of readings at or below threshold, with no inter-reading gap greater than two minutes.
- The event end time is set to the first reading in the qualifying low-demand sequence, not the later time when the five-minute condition is confirmed.
- A new event can be created after the previous event is resolved, including later in the same batch.
- Equipment recommendations are generated once when a new event is created. Existing duplicate protection remains in `EquipmentEligibilityService`.

## Required one-time database migration

1. Open MySQL Workbench and select `smart_building_db`.
2. Open and execute `PEAK_LIFECYCLE_MIGRATION.sql` once.
3. The script creates the processing-state table, marks the two supplied legacy test events (IDs 1 and 2) as `LEGACY_REVIEW`, and initializes building 1's cursor to the latest existing meter reading.
4. It does not delete meter readings, peak events, load schedules, or override logs. Event 1 and Event 2 are not falsely marked as resolved; they remain available for historical review.
5. Verify the two SELECT queries at the bottom of the script.

If your event IDs or building ID differ from the supplied test data, adjust the migration script after checking the SELECT output. Do not blindly run the `UPDATE` against different IDs.

## Run

- Keep MySQL running.
- Keep the Python data-processing project and its virtual environment at the configured path.
- Start Spring Boot from IntelliJ or run `mvn spring-boot:run` from this backend directory.
- The application uses port `8082` by default.
- Set `energy.scheduler.enabled=false` in `application.properties` to pause automatic scheduling during controlled Postman tests; set it back to `true` afterward.
- The scheduler initializes processing state, runs Python ingestion, and then processes all new valid readings for each building.

## Manual processing endpoint

`POST http://localhost:8082/api/peak-detection/1`

This processes any valid readings newer than the saved cursor. It does not replay already processed readings. If there are no pending readings, the endpoint returns HTTP 204.

## Important simulator note

The Python simulator currently creates a rolling batch of readings. The MySQL unique constraint on `(BUILDING_ID, READING_TIMESTAMP)` means the generator must not resend timestamps that already exist. Ensure its timestamp generation always creates fresh timestamps, or retain a persistent next timestamp. A duplicate-key insert failure should fail the ingestion run rather than silently advance processing.

## Important limitations

- The five-minute resolution rule requires readings at or below threshold spanning five minutes, and each adjacent reading gap must be at most two minutes. If readings stop arriving, an event will remain active; this is intentional because there is no evidence that demand stayed low.
- The cursor is ID-based. The simulator should submit readings in chronological order and should not insert late-arriving historical readings after the cursor has advanced.
- This is a simulation-only controller. `EXPECTED_REDUCTION_KW` is a theoretical estimate, not a measured physical reduction. No real equipment is controlled.
- The current userId-based override check is not authentication. Add proper Spring Security before production use.
- Use environment variables for database credentials outside local development; do not commit real passwords.

## Suggested validation sequence

1. Confirm migration state and legacy events in MySQL.
2. Add a fresh set of test readings with unique timestamps and known demand values.
3. Run `POST /api/peak-detection/1` or wait for the scheduler.
4. Query `PEAK_PROCESSING_STATE`, `PEAK_EVENTS`, and `LOAD_SCHEDULE`.
5. Verify: below-threshold readings create no event; first high reading creates one; further high readings update it; five minutes of continuous low readings resolve it; a subsequent high reading creates a new event.
6. Run the endpoint again without inserting readings and confirm no duplicate event or recommendation is created.
7. Retest load-schedule approve, reject, and override endpoints.
