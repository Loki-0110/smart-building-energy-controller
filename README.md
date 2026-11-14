# Smart Building Energy Peak-Shaving Controller

A simulation-based smart building energy management system designed to monitor electricity consumption, identify peak-demand events, and recommend load-reduction schedules while respecting occupancy, equipment priority, and operational constraints.

> **Project Scope:** This is a simulation and operator-recommendation system only. It does not control real equipment or guarantee actual energy savings.

## Technology Stack

- **Backend:** Java 21, Spring Boot, Maven
- **Frontend:** React, Vite, Node.js
- **Data Processing:** Python 3.12
- **Database:** MySQL 8
- **Analytics:** Snowflake, Power BI
- **Infrastructure:** Docker, AWS EC2, Amazon S3
- **CI/CD:** GitHub Actions

## Requirements

Ensure the following software is installed:

- Windows 10/11
- Java 21
- Maven 3.9+
- Node.js 20+
- Python 3.12+
- MySQL 8+

---

## 1. Database Setup

Use your existing `smart_building_db` database and schema.

The backend uses:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Hibernate validates the existing database schema. It will not automatically create or delete tables.

**Important:** Do not run destructive reset commands against a database containing existing project data.

### Configure MySQL credentials

Open PowerShell and set the database credentials:

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
```

Default database connection:

```text
jdbc:mysql://localhost:3306/smart_building_db
```

If required, override the connection URL using the `DB_URL` environment variable.

### Peak Lifecycle Migration

If your database has not received the peak lifecycle update:

1. Open `database/PEAK_LIFECYCLE_MIGRATION.sql`.
2. Review the SQL statements.
3. Verify the IDs referenced in the script against your existing database.
4. Execute the migration once after confirming the references.

Do not blindly execute sample-ID updates against different database records.

---

## 2. Start the Spring Boot Backend

Open the first PowerShell terminal.

Navigate to the backend directory:

```powershell
cd backend
```

Start the application:

```powershell
mvn spring-boot:run
```

Backend API base URL:

```text
http://localhost:8082/api
```

The default CORS origin is:

```text
http://localhost:5173
```

To change the frontend origin, configure the `FRONTEND_ORIGIN` environment variable.

---

## 3. Start the React Frontend

Open a second PowerShell terminal.

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm ci
```

Start the development server:

```powershell
npm run dev
```

Open the application:

```text
http://localhost:5173
```

### Optional API Configuration

Copy `.env.example` to `.env` and configure the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:8082/api
```

---

## 4. Python Meter-Reading Ingestion

Open a third PowerShell terminal.

Navigate to the data-processing directory:

```powershell
cd data-processing
```

Create a Python virtual environment:

```powershell
py -3.12 -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required dependencies:

```powershell
python -m pip install -r requirements.txt
```

Run the Python simulator:

```powershell
python main.py
```

### Scheduler Configuration

The backend scheduler:

- Starts 30 seconds after backend startup.
- Runs every five minutes.
- Invokes the Python script from the `data-processing` directory.

To pause the scheduler during manual API testing, update the following property in:

`backend/src/main/resources/application.properties`

```properties
energy.scheduler.enabled=false
```

Restart the backend after changing the property.

---

## 5. Main Application Workflow

Follow this sequence to use the application:

1. **Create a Building:** Add a building to the system.
2. **Add Equipment:** Register equipment with its priority and controllability details.
3. **Configure Occupancy:** Add occupancy windows for the building.
4. **Configure Peak Threshold:** Create an active peak configuration and define the demand threshold.
5. **Ingest Meter Readings:** Start Python ingestion or add meter readings manually through the API.
6. **Detect Peak Events:** Run peak detection from the Peak Events section or wait for the scheduler.
7. **Review Load Recommendations:** Open Load Schedule Approvals to review generated recommendations.
8. **Approve or Reject:** Only recommendations with `PENDING` status can be approved or rejected.
9. **Record Overrides:** Overrides require an active ADMIN/OPERATOR user ID available in `APP_USERS`.

### Equipment and Occupancy Constraints

- Critical equipment is protected.
- Non-controllable equipment is protected.
- Unknown occupancy is treated conservatively and blocks load reduction.
- Recommendations are generated within the configured operational constraints.

---

## 6. Important Fixes and Improvements

### Meter Reading Ingestion

- Ingestion is idempotent using `(building_id, reading_timestamp)`.
- Re-sending an existing reading returns the stored record.
- Duplicate readings no longer cause the entire batch to fail with MySQL error `1062`.

### Backend Error Handling

- Global API error handling logs unexpected exceptions.
- Validation errors return HTTP `400`.
- Missing resources return HTTP `404`.
- Invalid states and database conflicts return HTTP `409`.

### Approval Workflow

- Approval operations use `saveAndFlush`.
- Invalid approval states return a conflict response.
- The response includes the current recommendation status.

### Frontend Improvements

- Table keys are unique.
- Successful CRUD operations retain their success notices after refresh.
- Peak-detection and schedule actions retain their success notices after refresh.

### Python Simulator

- New meter-reading timestamps are calculated after the latest stored reading for each building.
- This prevents overlapping rolling batches.

---

## 7. Important Limitations

1. **No Physical Equipment Control:** Approval, rejection, and override operations are operator workflow records only. No physical equipment is switched on or off.
2. **Simulated Energy Reduction:** `EXPECTED_REDUCTION_KW` represents a simulated estimate, not measured energy savings.
3. **Authentication:** The user-ID override check is not authentication. Spring Security and proper authorization must be implemented before public deployment.
4. **Database Compatibility:** Backend startup depends on the existing MySQL database matching the application's entity mappings.
5. **Simulation Scope:** Results are intended for demonstration, analysis, and operator recommendations.

---

## 8. Verification Status

The application components were verified during local development.

| Component | Verification |
|---|---|
| Python meter-reading simulator | Verified |
| Spring Boot backend | Verified |
| React frontend | Verified |
| MySQL database connectivity | Verified |
| Backend API integration | Verified |
| Frontend and backend integration | Verified |
| Application workflow | Verified |



### Verification Notes

- Python syntax validation passed.
- A fresh Maven build could not be completed because Maven was not installed in the verification environment.
- `npm ci` could not complete because the npm registry dependency download timed out.
- Therefore, a fresh Vite production build could not be verified in that environment.

Run the setup commands on Windows with the required software installed. If any build or runtime error occurs, review the terminal output and resolve the issue before deployment.

---

## 9. Project Disclaimer

This project demonstrates a smart building energy peak-shaving workflow using simulated meter readings, peak-demand detection, equipment constraints, and operator recommendations.

It is intended as an educational and demonstration project. It does not provide real-time physical equipment control or guarantee actual electricity cost or energy savings.
