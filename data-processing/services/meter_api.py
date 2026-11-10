
import requests

from config.settings import API_URL


def send_readings_to_api(valid_readings):

    successful = 0
    failed = 0

    # Convert Pandas DataFrame into a list of row dictionaries.
    records = valid_readings.to_dict(orient="records")

    print(f"Preparing to submit {len(records)} valid readings.")

    for reading in records:

        # Read values using Python DataFrame column names.
        timestamp = reading["reading_timestamp"]

        payload = {
            "buildingId": int(reading["building_id"]),
            "readingTimestamp": timestamp,
            "demandKw": float(reading["demand_kw"]),
            "sourceName": reading["source_name"],
            "dataQualityStatus": "VALID"
        }

        try:
            print(f"Submitting reading: {timestamp}")

            response = requests.post(
                API_URL,
                json=payload,
                timeout=15
            )

            response.raise_for_status()

            successful += 1

        except requests.RequestException as error:

            failed += 1

            print(
                f"Failed to submit reading {timestamp}: {error}"
            )

            if error.response is not None:
                print("API response:", error.response.text)

    print("\n========== API SUBMISSION REPORT ==========")
    print(f"Total records: {len(records)}")
    print(f"Successfully submitted: {successful}")
    print(f"Failed submissions: {failed}")
    print("===========================================\n")

    if failed > 0:
        raise RuntimeError(
            f"{failed} meter reading(s) could not be submitted."
        )

    return successful
