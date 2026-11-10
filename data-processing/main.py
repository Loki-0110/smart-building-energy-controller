
import os

from simulator.meter_simulator import generate_meter_readings
from validation.data_validator import validate_readings
from services.meter_api import send_reading


def main():

    print("\n===================================")
    print(" SMART BUILDING DATA QUALITY CHECK ")
    print("===================================\n")

    # 1. Generate meter readings
    df = generate_meter_readings(15)

    print("Generated readings:")
    print(df.to_string(index=False))

    # 2. Perform data cleaning and validation
    valid_readings, rejected_readings, report = validate_readings(df)

    # 3. Display quality report
    print("\n========== DATA QUALITY REPORT ==========")

    print(f"Total readings       : {report['total']}")
    print(f"Missing values       : {report['missing']}")
    print(f"Invalid demand       : {report['invalid_demand']}")
    print(f"Invalid timestamps   : {report['invalid_timestamp']}")
    print(f"Duplicate readings   : {report['duplicates']}")
    print(f"Valid readings       : {report['valid']}")
    print(f"Rejected readings    : {report['rejected']}")

    # 4. Save rejected records
    if not rejected_readings.empty:

        os.makedirs("reports", exist_ok=True)

        rejected_readings.to_csv(
            "reports/rejected_readings.csv",
            index=False
        )

        print("\nRejected records saved to reports/rejected_readings.csv")

    # 5. Send only valid records to Spring Boot
    print("\nSending valid readings to Spring Boot...")

    for _, reading in valid_readings.iterrows():

        send_reading(reading)

    print("\nData processing completed.")


if __name__ == "__main__":
    main()
