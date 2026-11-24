# Module 5 — Activity 5.2: Quality Attribute Measurements & Metrics Dashboard

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Metric definitions & automated checks authored) | `PENDING` (Live SonarQube complexity/duplication export screenshot)

## 1. Objective
Define quantitative product and process measurements across BillBook's frontend and backend modules and verify threshold compliance without fabricating external tool metrics.

## 2. Measurement Baseline Table

| Metric ID | Quality Measurement | Formula / Tool | Threshold | Verified Value / Status |
|---|---|---|---|---|
| QM-01 | GST Calculation Accuracy Rate | `(Passed Cases / 50) * 100` | `100%` | **100% (50/50)** via `datasets.test.ts` (Java `mvn test` **PENDING** local run) |
| QM-02 | Injected Anomaly Recall | `(True Positives / Injected) * 100` | `>= 70%` | **100% (10/10)** via `datasets.test.ts` with `0` false positives |
| QM-03 | Backend Instruction Coverage | JaCoCo XML (`mvn verify`) | `>= 80%` | **PENDING** local `mvn verify` |
| QM-04 | TypeScript Type Safety Errors | `tsc --noEmit` | `0` | Verified in final build/lint pass |
| QM-05 | SonarQube Blocker / Critical Bugs | `sonar-scanner` | `0` | **PENDING** local SonarQube scan |

## 3. Expected Evidence
- Quantitative KPI table (`ACTIVITY.md`) and `/tests/results/EXECUTION_RESULTS_TEMPLATE.md`.
