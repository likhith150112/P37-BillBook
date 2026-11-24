# Module 3 — Activity 3.6: Docker & Docker Compose Containerization

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`Dockerfile`, `backend/Dockerfile`, `nginx.conf`, `docker-compose.yml` complete) | `PENDING` (Local `docker compose ps` screenshot)

## 1. Objective
Containerize the full 3-tier **BillBook** stack (**MySQL 8**, **Spring Boot 3**, **React + Nginx**) so anyone can boot the complete Production Mode environment with one command.

## 2. Multi-Container Architecture
- **`mysql` (`mysql:8.0`, port `3306`)**: Auto-initializes `database/schema.sql` and `database/seed.sql` with `mysqladmin ping` healthcheck.
- **`backend` (`backend/Dockerfile`, port `8080`)**: Multi-stage Maven Temurin-17 build -> Alpine JRE image, waits on healthy `mysql`.
- **`frontend` (`Dockerfile` + `nginx.conf`, port `3000 -> 80`)**: Builds Vite bundle with `VITE_API_BASE_URL=/api`, serves SPA via Nginx and reverse-proxies `/api/` and `/actuator/` to `http://backend:8080`.

## 3. Expected Evidence
- `/Dockerfile`, `/backend/Dockerfile`, `/nginx.conf`, `/docker-compose.yml`.
- Local `docker compose up --build` terminal output (**PENDING** Docker Desktop run via `scripts/windows/start-docker.ps1`).
