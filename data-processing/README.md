# Python meter-reading ingestion

This folder provides the Python simulator expected by the Spring Boot scheduler. It generates 15 new, minute-spaced readings per registered building, validates the payloads, writes rejected rows to `reports/rejected_readings.csv`, and posts valid readings to `/api/meter-readings`.

## Windows setup

```powershell
cd data-processing
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

The API base URL defaults to `http://localhost:8082/api`; override it with `ENERGY_API_BASE_URL` if needed.

The simulator reads the latest stored timestamp per building and starts after it. This prevents the rolling-window timestamp overlap that previously caused MySQL duplicate-key failures. The backend also makes the create endpoint idempotent as a second line of defence.
