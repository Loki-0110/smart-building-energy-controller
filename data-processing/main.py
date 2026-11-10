from simulator.meter_simulator import generate_meter_readings
from validation.data_validator import validate_readings
from services.meter_api import send_reading


def main():

    print("Starting Smart Building Meter Simulator...")

    # Generate readings
    df = generate_meter_readings(15)

    print("\nGenerated Readings:")
    print(df)

    # Validate readings
    valid_readings = validate_readings(df)

    print("\nValidated Readings:")
    print(valid_readings)

    # Send readings to Spring Boot
    print("\nSending readings to Spring Boot...")

    for _, reading in valid_readings.iterrows():

        send_reading(reading)

    print("\nSimulation completed.")


if __name__ == "__main__":
    main()