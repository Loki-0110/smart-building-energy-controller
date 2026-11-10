
import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def generate_meter_readings(count=15):

    np.random.seed(42)

    current_time = datetime.now().replace(
        second=0,
        microsecond=0
    )

    # Generate normal electricity demand values
    demand_values = np.random.uniform(150, 200, count)

    readings = []

    for i in range(count):

        readings.append({
            "readingTimestamp": (
                current_time + timedelta(minutes=i)
            ).strftime("%Y-%m-%dT%H:%M:%S"),

            "demandKw": round(float(demand_values[i]), 2)
        })

    # Convert generated records into a DataFrame
    df = pd.DataFrame(readings)

    # Introduce invalid records for testing
    if count >= 8:

        # Invalid negative demand
        df.loc[2, "demandKw"] = -10

        # Missing demand
        df.loc[4, "demandKw"] = np.nan

        # Duplicate timestamp
        df.loc[6, "readingTimestamp"] = df.loc[5, "readingTimestamp"]

        # Invalid timestamp
        df.loc[7, "readingTimestamp"] = "INVALID_TIMESTAMP"

    return df
