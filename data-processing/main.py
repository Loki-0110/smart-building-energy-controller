
import sys

from services.meter_api import MeterApiClient
from reports.report_service import save_rejected_readings

from simulator.meter_simulator import generate_readings
from validation.data_validator import validate_readings


def main():

    print(
        "========== PYTHON INGESTION STARTED ==========",
        flush=True
    )

    api = MeterApiClient()

    # Step 1: Fetch buildings from Spring Boot.
    buildings = api.get_buildings()

    if not buildings:
        print(
            "No buildings found. Add a building first.",
            flush=True
        )
        return

    # Step 2: Fetch existing meter readings.
    existing_readings = api.get_meter_readings() or []

    print(
        f"Buildings fetched: {len(buildings)}",
        flush=True
    )

    print(
        f"Existing readings fetched: {len(existing_readings)}",
        flush=True
    )

    # Step 3: Generate new readings.
    generated = []

    for building in buildings:

        building_id = building.get("buildingId")

        if not building_id:
            print(
                f"Skipping invalid building: {building}",
                file=sys.stderr,
                flush=True
            )
            continue

        try:

            building_readings = generate_readings(
                building,
                existing_readings
            )

            generated.extend(building_readings)

        except Exception as exc:

            print(
                f"Failed to generate readings for "
                f"building {building_id}: {exc}",
                file=sys.stderr,
                flush=True
            )

            raise

    # Step 4: Validate readings.
    valid, rejected = validate_readings(
        generated,
        existing_readings
    )

    # Step 5: Save rejected readings report.
    report_path = save_rejected_readings(rejected)

    print(
        f"Buildings: {len(buildings)} | "
        f"Generated: {len(generated)} | "
        f"Valid: {len(valid)} | "
        f"Rejected: {len(rejected)}",
        flush=True
    )

    print(
        f"Rejected readings report: {report_path}",
        flush=True
    )

    # Step 6: Submit valid readings to Spring Boot.
    successful = 0
    failed = []

    for reading in valid:

        try:

            api.submit_meter_reading(reading)

            successful += 1

            print(
                f"Submitted building "
                f"{reading['buildingId']} at "
                f"{reading['readingTimestamp']} | "
                f"Demand: {reading['demandKw']} kW",
                flush=True
            )

        except Exception as exc:

            failed.append({
                "reading": reading,
                "error": str(exc)
            })

            print(
                f"Failed reading "
                f"{reading['readingTimestamp']}: {exc}",
                file=sys.stderr,
                flush=True
            )

    # Step 7: Final ingestion summary.
    print(
        "\n========== INGESTION SUMMARY ==========",
        flush=True
    )

    print(
        f"Generated readings : {len(generated)}",
        flush=True
    )

    print(
        f"Valid readings     : {len(valid)}",
        flush=True
    )

    print(
        f"Rejected readings  : {len(rejected)}",
        flush=True
    )

    print(
        f"Successful uploads : {successful}",
        flush=True
    )

    print(
        f"Failed uploads     : {len(failed)}",
        flush=True
    )

    print(
        "=======================================",
        flush=True
    )

    if failed:
        raise RuntimeError(
            f"{len(failed)} meter reading(s) failed to submit."
        )

    print(
        "========== PYTHON INGESTION COMPLETED ==========",
        flush=True
    )


if __name__ == "__main__":

    try:
        main()

    except Exception as exc:

        print(
            f"PYTHON INGESTION FAILED: {exc}",
            file=sys.stderr,
            flush=True
        )

        raise
