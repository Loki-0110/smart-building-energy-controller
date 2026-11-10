
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd

from config.settings import (
    BUILDING_ID,
    SOURCE_NAME,
    NUMBER_OF_READINGS,
    READING_INTERVAL_MINUTES
)

IST = ZoneInfo("Asia/Kolkata")


def generate_readings():

    # Generate timestamps using Indian Standard Time.
    now = datetime.now(IST).replace(tzinfo=None, microsecond=0)

    timestamps = [
        now - timedelta(
            minutes=READING_INTERVAL_MINUTES * (NUMBER_OF_READINGS - i - 1)
        )
        for i in range(NUMBER_OF_READINGS)
    ]

    # Debug timestamp generation.
    print("\n========== TIMESTAMP DEBUG ==========")
    print("Current Python IST:", datetime.now(IST))
    print("First generated timestamp:", timestamps[0])
    print("Last generated timestamp:", timestamps[-1])
    print("=====================================\n")

    # Generate random electricity demand values.
    demands = np.random.uniform(
        150, 200, NUMBER_OF_READINGS
    ).round(2)

    readings = []

    for timestamp, demand in zip(timestamps, demands):
        readings.append({
            "building_id": BUILDING_ID,
            "reading_timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%S"),
            "demand_kw": float(demand),
            "source_name": SOURCE_NAME
        })

    # Test data-quality validation rules.
    readings[2]["demand_kw"] = -10
    readings[4]["demand_kw"] = None
    readings[6]["reading_timestamp"] = readings[5]["reading_timestamp"]
    readings[7]["reading_timestamp"] = "invalid-timestamp"

    print(f"Generated {len(readings)} meter readings.")

    return pd.DataFrame(readings)
