
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any

from config.settings import (
    READINGS_PER_BUILDING,
    SIMULATOR_SOURCE_NAME
)


def generate_readings(
    building: dict[str, Any],
    existing_readings: list[dict[str, Any]],
    count: int = READINGS_PER_BUILDING
) -> list[dict[str, Any]]:

    building_id = int(building["buildingId"])

    existing_timestamps = []

    for reading in existing_readings:
        try:
            if int(reading.get("buildingId", -1)) == building_id:
                timestamp = datetime.fromisoformat(
                    str(reading["readingTimestamp"]).replace(
                        "Z", "+00:00"
                    )
                ).replace(tzinfo=None)

                existing_timestamps.append(timestamp)

        except (ValueError, TypeError, KeyError):
            continue

    if existing_timestamps:
        start_time = max(existing_timestamps) + timedelta(minutes=1)
    else:
        start_time = (
            datetime.now().replace(second=0, microsecond=0)
            - timedelta(minutes=count - 1)
        )

    # Different buildings have different normal demand levels.
    base_kw = Decimal("110") + Decimal(
        str((building_id * 13) % 21)
    )

    readings = []

    for index in range(count):

        # First 5: Normal demand
        if index < 5:
            demand = base_kw + Decimal(str(index * 2))

        # Next 4: Increasing demand
        elif index < 9:
            demand = Decimal("145") + Decimal(
                str((index - 5) * 8)
            )

        # Remaining: Peak demand
        else:
            demand = Decimal("185") + Decimal(
                str((index - 9) * 6)
            )

        # Small variation based on building ID
        demand += Decimal(str(building_id % 5))

        demand = demand.quantize(Decimal("0.01"))

        timestamp = start_time + timedelta(minutes=index)

        readings.append({
            "buildingId": building_id,
            "readingTimestamp": timestamp.strftime(
                "%Y-%m-%dT%H:%M:%S"
            ),
            "demandKw": str(demand),
            "sourceName": SIMULATOR_SOURCE_NAME,
            "dataQualityStatus": "VALID"
        })

    return readings
