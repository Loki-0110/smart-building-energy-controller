# Smart Building Energy Peak-Shaving Controller — Frontend

A medium-complexity React frontend designed for the existing Spring Boot backend.

## Included screens
- Dashboard overview
- Buildings
- Equipment
- Meter readings
- Peak events
- Load schedule approvals, rejection and override
- Peak configuration

## Requirements
- Node.js 20+
- Backend running at `http://localhost:8082`

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env` (or create `.env`) and confirm the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8082/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

Create a production build:

```bash
npm run build
```

## Backend API assumptions

The frontend uses the API routes shared for this project:

- `/buildings`
- `/equipment`
- `/meter-readings`
- `/peak-configs`
- `/occupancy-schedules`
- `/peak-detection/{buildingId}`
- `/load-schedules/pending`
- `/load-schedules/{scheduleId}/approve`
- `/load-schedules/{scheduleId}/reject`
- `/load-schedules/{scheduleId}/override`

The UI also attempts GET-all calls for meter readings, peak events and load schedules. If your backend does not expose one of those GET-all routes, that screen will show an API error and the other screens will continue to work. Adjust the route in `src/api/endpoints.js` to match your controller.

## Important
- This is a simulation/monitoring interface. It does not control physical equipment.
- Expected reduction values are estimates, not measured energy savings.
- The override screen sends the `userId`, `newAction` and `reason` fields expected by the current backend.
- The frontend does not implement authentication. Do not expose this application publicly without adding proper authentication and authorization.
