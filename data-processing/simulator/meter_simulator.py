import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def generate_meter_readings(count=15):

    np.random.seed(42)

    current_time = datetime.now().replace(second=0, microsecond=0)

    demand_values = np.random.uniform(150, 200, count)

    readings = []

    for i in range(count):

        readings.append({
            "readingTimestamp": (
                current_time + timedelta(minutes=i)
            ).strftime("%Y-%m-%dT%H:%M:%S"),

            "demandKw": round(float(demand_values[i]), 2)
        })

    df = pd.DataFrame(readings)

    return df