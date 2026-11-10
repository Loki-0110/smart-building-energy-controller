
import os
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[1]

REPORT_DIR = PROJECT_DIR / "reports"
REJECTED_REPORT = REPORT_DIR / "rejected_readings.csv"

API_BASE_URL = os.getenv(
    "ENERGY_API_BASE_URL",
    "http://localhost:8082/api"
).rstrip("/")

REQUEST_TIMEOUT_SECONDS = int(
    os.getenv("ENERGY_API_TIMEOUT_SECONDS", "20")
)

READINGS_PER_BUILDING = int(
    os.getenv("READINGS_PER_BUILDING", "15")
)

SIMULATOR_SOURCE_NAME = os.getenv(
    "SIMULATOR_SOURCE_NAME",
    "PYTHON_SIMULATOR"
)
