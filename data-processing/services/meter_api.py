import requests

from config.settings import (
    API_URL,
    BUILDING_ID,
    SOURCE_NAME
)


def send_reading(reading):

    payload = {
        "buildingId": BUILDING_ID,
        "readingTimestamp": reading["readingTimestamp"],
        "demandKw": float(reading["demandKw"]),
        "sourceName": SOURCE_NAME,
        "dataQualityStatus": reading["dataQualityStatus"]
    }

    try:

        response = requests.post(
            API_URL,
            json=payload,
            timeout=10
        )

        response.raise_for_status()

        print("Reading inserted:", payload["demandKw"], "kW")

    except requests.RequestException as error:

        print("Failed to insert reading:", error)