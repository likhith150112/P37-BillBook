# Module 3 — Activity 3.7: Deployment Documentation & Runtime Configuration

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`WINDOWS_SETUP.md`, `.env.example`, PowerShell scripts, Actuator endpoints configured)

## 1. Objective
Provide repeatable deployment documentation covering environment variables, database initialization, CORS origins, Spring Boot Actuator health checks, Windows PowerShell startup, and Docker production orchestration.

## 2. Environment Variables (Zero Committed Secrets)
Documented in `/.env.example`:
- `VITE_API_BASE_URL`: Frontend Production API URL (`http://localhost:8080/api` locally, `/api` inside Docker Nginx).
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`: Supplied locally via `.env` (git-ignored).
- `BILLBOOK_SELLER_STATE` (`Karnataka`), `BILLBOOK_SELLER_GSTIN`: Controls Intra-State vs Inter-State tax determination.
- `BILLBOOK_CORS_ORIGINS`: Configurable CORS origins for `CorsConfig.java`.

## 3. Health & Monitoring Endpoints
- `GET http://localhost:8080/actuator/health`
- `GET http://localhost:8080/actuator/metrics`
- `GET http://localhost:8080/api/config/seller`

## 4. Expected Evidence
- `/WINDOWS_SETUP.md`, `/scripts/windows/*.ps1`, `/.env.example`, `/nginx.conf`.
