# Module 5 — Activity 5.3: SonarQube Configuration & Static Analysis

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`/sonar-project.properties` & static audit checklist) | `PENDING` (Local SonarQube dashboard screenshot showing 0 blockers)

## 1. Objective
Configure **SonarQube** static analysis covering both Java Spring Boot (`backend/src/main/java` + JaCoCo XML) and React TypeScript (`src/`), and resolve potential code smells, bugs, and security hotspots.

## 2. Configuration (`/sonar-project.properties`)
- `sonar.projectKey=p37-billbook-gst-billing`
- `sonar.sources=src,backend/src/main/java`
- `sonar.java.source=17`
- `sonar.coverage.jacoco.xmlReportPaths=backend/target/site/jacoco/jacoco.xml`

## 3. Pre-Scan Static Hygiene Fixes Already Applied
1. Parameterized JPQL/Spring Data JPA queries (zero string-concatenated SQL).
2. Replaced hardcoded permissive CORS list with `${BILLBOOK_CORS_ORIGINS:...}` env property.
3. Removed hardcoded passwords from versioned source (placeholder defaults only via `${SPRING_DATASOURCE_PASSWORD:changeme_local_only}`).
4. Added `@RestControllerAdvice GlobalExceptionHandler` instead of silent `null`/stacktrace responses.
5. Guarded `BigDecimal` division & inputs against `null` / invalid GST slabs in `GstCalculationService.java`.

## 4. Expected Evidence
- `/sonar-project.properties`.
- Local SonarQube project overview screenshot after running `sonar-scanner` (**PENDING** local SonarQube Server run).
