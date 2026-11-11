
import random
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any
from zoneinfo import ZoneInfo

from config.settings import (
    READINGS_PER_BUILDING,
    SIMULATOR_SOURCE_NAME
)

INDIA_TIMEZONE = ZoneInfo("Asia/Kolkata")


def generate_readings(
    building: dict[str, Any],
    existing_readings: list[dict[str, Any]],
    count: int = READINGS_PER_BUILDING
) -> list[dict[str, Any]]:

    building_id = int(building["buildingId"])

    # Generate readings using current Indian time.
    start_time = (
        datetime.now(INDIA_TIMEZONE)
        .replace(second=0, microsecond=0)
        - timedelta(minutes=count - 1)
    )

    # Different buildings have different normal demand levels.
    base_kw = Decimal("110") + Decimal(
        str((building_id * 13) % 21)
    )

    current_demand = float(base_kw)
    readings = []

    for index in range(count):

        # Normal demand fluctuations.
        change = random.uniform(-8, 8)

        # Occasionally simulate a sudden demand increase.
        if random.random() < 0.10:
            change += random.uniform(10, 25)

        # Occasionally simulate reduced electricity consumption.
        if random.random() < 0.15:
            change -= random.uniform(10, 20)

        current_demand += change

        # Keep demand within the configured simulation range.
        current_demand = max(90, min(current_demand, 220))

        demand = Decimal(str(current_demand)).quantize(
            Decimal("0.01")
        )

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
