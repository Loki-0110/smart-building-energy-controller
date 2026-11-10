# Smart Building Energy Peak-Shaving Controller

Combined project bundle: Spring Boot backend, React frontend, and Python meter-reading simulator. This is a simulation and operator-recommendation system only; it does not switch real equipment or guarantee actual energy savings.

## Requirements
- Windows 10/11, Java 21, Maven 3.9+, Node.js 20+, Python 3.12+, MySQL 8+

## 1. Database
Use your existing `smart_building_db` database and schema. The backend uses Hibernate `ddl-auto=validate`; it will not create or delete tables automatically. Do not run destructive reset commands against a database containing data.

Set the MySQL credentials in PowerShell before starting the backend:
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
```
Default connection: `jdbc:mysql://localhost:3306/smart_building_db`. Override with `DB_URL` if needed.

If your database has not had the peak lifecycle update, review `database/PEAK_LIFECYCLE_MIGRATION.sql` and execute it once after checking the IDs referenced by the script. Do not blindly run sample-ID updates against different data.

## 2. Start backend
```powershell
cd backend
mvn spring-boot:run
```
API: `http://localhost:8082/api`. CORS defaults to `http://localhost:5173`; override with `FRONTEND_ORIGIN` if needed.

## 3. Start frontend (second terminal)
```powershell
cd frontend
npm ci
npm run dev
```
Open `http://localhost:5173`. Optional API override: copy `.env.example` to `.env` and set `VITE_API_BASE_URL=http://localhost:8082/api`.

## 4. Start Python ingestion (third terminal)
```powershell
cd data-processing
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```
The scheduler starts 30 seconds after backend startup and runs every five minutes. It invokes the Python script from `data-processing`. To pause it for manual API work, set `energy.scheduler.enabled=false` in `backend/src/main/resources/application.properties` and restart the backend.

## Main workflow
1. Create a building.
2. Add equipment. Critical and non-controllable equipment is protected.
3. Add occupancy windows. Unknown occupancy is treated conservatively and blocks load reduction.
4. Add an active peak configuration and threshold.
5. Start Python ingestion or add meter readings manually.
6. Run peak detection from Peak Events or wait for the scheduler.
7. Review recommendations in Load Schedule Approvals. Only `PENDING` recommendations can be approved/rejected. Overrides require an active ADMIN/OPERATOR user ID in `APP_USERS`.

## Fixes included
- Meter-reading ingestion is idempotent on `(building_id, reading_timestamp)`. Re-sending an existing reading returns the stored row instead of failing the whole batch with MySQL error 1062.
- Global API error handling logs unexpected exceptions; validation returns 400, missing resources 404, and invalid state/database conflicts 409.
- Approval uses `saveAndFlush` and invalid approval state now returns a conflict response with the current status.
- Frontend table keys are unique; successful CRUD, peak-detection, and schedule actions retain their success notices after refresh.
- Python simulator calculates timestamps after the latest stored reading for each building, preventing overlapping rolling batches.

## Important limitations
- Approval/rejection/override are operator workflow records only; no physical equipment is controlled.
- `EXPECTED_REDUCTION_KW` is a simulated estimate, not measured savings.
- The user-ID override check is not authentication. Add Spring Security and authorization before public deployment.
- Backend schema compatibility depends on the existing MySQL database matching the entity mappings.

## Verification status
Python syntax validation passed. A fresh Maven build could not be run because Maven is not installed in this environment. `npm ci` could not complete because the npm registry dependency download timed out, so a fresh Vite production build could not be verified here. Run the setup commands on Windows and share any remaining build/runtime error for targeted debugging.
