# Smart Building Energy Peak-Shaving Controller

## Project Overview

The Smart Building Energy Peak-Shaving Controller is a simulation-based application designed to monitor building electricity demand, detect peak-demand events and generate recommendations for reducing eligible non-critical electrical loads.

The system protects critical equipment and considers occupancy and comfort constraints before generating recommendations.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Java 21, Spring Boot |
| Frontend | React.js |
| Database | MySQL |
| Data Processing | Python, NumPy, Pandas |
| Data Warehouse | Snowflake |
| Cloud Storage | AWS S3 |
| Dashboard | Power BI |
| Containerization | Docker |
| CI/CD | GitHub Actions |
| Cloud Deployment | AWS EC2 |

## Project Structure

- `backend/` – Spring Boot application
- `frontend/` – React application
- `database/` – MySQL schema and sample data scripts
- `data-processing/` – Python data processing
- `analytics/` – Snowflake and Power BI resources
- `infrastructure/` – Docker and deployment configuration
- `docs/` – Project documentation and screenshots

## Current Development Status

- [x] Project architecture finalized
- [x] MySQL database created
- [x] Ten core database tables created
- [x] Sample records inserted and verified
- [ ] GitHub repository setup
- [ ] Spring Boot backend MVP
- [ ] React frontend MVP
- [ ] Backend and frontend integration
- [ ] Docker integration
- [ ] Peak detection and scheduling logic
- [ ] Python analytics pipeline
- [ ] AWS deployment and CI/CD

## Project Boundary

This is a simulation-only project. It does not directly control physical building equipment. Any projected savings are labelled simulated.

## Development Approach

The backend and frontend will initially be developed and tested independently. They will then be integrated locally, containerized using Docker and deployed through a CI/CD workflow.
