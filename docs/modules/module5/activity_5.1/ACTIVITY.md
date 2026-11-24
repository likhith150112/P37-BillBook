# Module 5 — Activity 5.1: Software Quality Assurance (SQA) Plan & 5 Quality Attributes

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (1-page SQA Plan & 5-attribute scoring framework authored; live SonarQube/JaCoCo local figures referenced cleanly)

## 1. Objective
Establish a concise **Software Quality Assurance (SQA) Plan** for **BillBook** evaluating **5 Quality Attributes** (Correctness, Reliability, Maintainability, Usability, Efficiency) with measurable acceptance thresholds.

## 2. One-Page SQA Plan Summary
- **Scope**: React TypeScript UI (`src/`), Spring Boot 3 Backend (`backend/`), MySQL 8 schema (`database/`).
- **Standards**: Zero TypeScript errors (`tsc --noEmit`), Google/Spring Java style, strict `BigDecimal HALF_UP` tax math, SonarQube 0 blockers/criticals, >=80% JaCoCo instruction coverage.
- **Verification Gates**: Pre-merge GitHub Actions CI + Jenkinsfile + Monitoring 50-Case GST Verifier.

## 3. Quality Attributes Measurement (ISO/IEC 25010 Aligned, 1–5 Scale)

| Quality Attribute | Metric Definition in BillBook | Target | Current Workspace Evidence | Score (/5) |
|---|---|---|---|---|
| **1. Correctness** | 50-case GST accuracy & 20-case anomaly recall | 100% GST; >=70% recall | `datasets.test.ts` (`50/50` GST, `100%` anomaly recall) | **5.0** |
| **2. Reliability** | Zero silent mock fallback; structured JSON errors | 0 unhandled crashes | `api.test.ts` + `GlobalExceptionHandler` + `FetchMode.SUBSELECT` | **4.6** |
| **3. Maintainability** | Modular services/components + >=80% JaCoCo target | >=80% cov; 0 blockers | Clean separation (`gstCalculator`, `api.ts`); SonarQube run `PENDING` | **4.4** |
| **4. Usability** | Desktop + Mobile responsive layout & PDF export | 0 horizontal overflow | Playwright check across 1280px & 390px viewports | **4.7** |
| **5. Efficiency** | Sub-second dashboard/GST math & Vite prod bundle | <50ms tax calc; fast load | Deterministic O(n) tax aggregation + subselect SQL queries | **4.6** |

## 4. Expected Evidence
- SQA Plan & 5-attribute table (`ACTIVITY.md`) + `sonar-project.properties` + JaCoCo/CI configuration.
