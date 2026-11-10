
import traceback

from simulator.meter_simulator import generate_readings
from validation.data_validator import validate_readings
from services.meter_api import send_readings_to_api

from pathlib import Path


def main():

    try:
        print("========== PYTHON INGESTION STARTED ==========")

        # Step 1: Generate meter readings.
        df = generate_readings()

        # Step 2: Validate generated readings.
        valid_readings, rejected_readings, report = validate_readings(df)

        print("\n========== DATA QUALITY REPORT ==========")
        print(f"Total readings: {report['total']}")
        print(f"Valid readings: {report['valid']}")
        print(f"Rejected readings: {report['rejected']}")
        print(f"Missing values: {report['missing']}")
        print(f"Invalid demand: {report['invalid_demand']}")
        print(f"Invalid timestamps: {report['invalid_timestamp']}")
        print(f"Duplicate timestamps: {report['duplicates']}")
        print("==========================================")

        # Step 3: Save rejected readings.
        if not rejected_readings.empty:

            reports_dir = Path("reports")
            reports_dir.mkdir(exist_ok=True)

            rejected_file = reports_dir / "rejected_readings.csv"

            rejected_readings.to_csv(
                rejected_file,
                index=False
            )

            print(f"Rejected readings saved to: {rejected_file}")

        # Step 4: Submit valid readings to Spring Boot.
        if not valid_readings.empty:

            successful = send_readings_to_api(valid_readings)

            print(f"Submitted readings: {successful}")

        else:
            print("No valid readings available for submission.")

        print("========== PYTHON INGESTION COMPLETED ==========")

    except Exception as error:

        print(f"PYTHON INGESTION FAILED: {error}")
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
