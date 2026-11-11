
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_DIR = Path(__file__).resolve().parents[1]

load_dotenv(PROJECT_DIR / ".env")

# Existing application settings
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

# MySQL settings
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")

# Snowflake settings
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SNOWFLAKE_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE", "ENERGY_WH")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE", "ENERGY_ANALYTICS")
SNOWFLAKE_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA", "ANALYTICS")
SNOWFLAKE_ROLE = os.getenv("SNOWFLAKE_ROLE", "SYSADMIN")
