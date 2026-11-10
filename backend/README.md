# Smart Building Energy Peak-Shaving Controller — Layered Backend MVP

## Package structure
- `controller`: REST endpoints and HTTP handling
- `service`: application/business service methods
- `repository`: Spring Data JPA database access
- `entity`: JPA mappings to existing MySQL tables
- `exception`: API error handling
- `config`: CORS configuration

## Requirements
Java 21, Maven 3.9+, MySQL 8+, and the existing `smart_building_db` schema.

## Configure MySQL (Windows CMD)
```cmd
set DB_URL=jdbc:mysql://localhost:3306/smart_building_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
set DB_USERNAME=root
set DB_PASSWORD=YOUR_MYSQL_PASSWORD
```
Do not commit credentials. `ddl-auto=validate` checks mappings and does not create/drop tables.

## Run
```cmd
mvn clean spring-boot:run
```
Base URL: `http://localhost:8080`

## API endpoints
| Module | Endpoint |
|---|---|
| Building | `/api/buildings` |
| Equipment | `/api/equipment` |
| Meter Reading | `/api/meter-readings` |
| Occupancy Schedule | `/api/occupancy-schedules` |
| Peak Configuration | `/api/peak-configs` |

All five resources currently support GET all, GET by ID, POST, PUT and DELETE.

This is a CRUD foundation only. Peak detection, scheduler, eligibility rules, operator approval, override/audit, authentication and analytics will be implemented in later milestones. Simulation only; no physical equipment is controlled.
