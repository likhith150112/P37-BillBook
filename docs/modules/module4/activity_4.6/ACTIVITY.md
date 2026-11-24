# Module 4 — Activity 4.6: Risk-Based Test Prioritisation

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Prioritise BillBook regression test suites by **Financial Impact x Failure Probability** so critical GST and payment defects are caught first in every CI run.

## 2. Risk-Based Prioritisation Matrix (Scale 1–5)

| Test Suite / Component | Business Impact (1–5) | Likelihood of Regression (1–5) | Risk Score (`I x L`) | Priority Tier | Execution Cadence |
|---|---|---|---|---|---|
| `GstCalculationService` & 50-Case Dataset | 5 (Legal/Tax penalty) | 4 (Rounding/float drift) | **20** | **P0 — Critical** | Every commit & PR |
| Production Mode API Isolation (`api.test.ts`) | 5 (Silent mock data corruption) | 4 (Fallback mistakes) | **20** | **P0 — Critical** | Every commit & PR |
| Anomaly Screening & Recall (`datasets.test.ts`) | 4 (Missed fraud/errors) | 4 (Threshold tuning) | **16** | **P1 — High** | Every commit & PR |
| Full-Stack Spring Boot MockMvc (`BillBookIntegrationTest`) | 5 (Persistence failure) | 3 (JPA/DTO changes) | **15** | **P1 — High** | Every PR / `mvn verify` |
| Selenium POM E2E Journey | 4 (UI flow break) | 3 (Selector/DOM change) | **12** | **P2 — Medium** | Pre-release / Nightly |
| Responsive CSS & Print Modal Check | 3 (UX annoyance) | 2 (Layout changes) | **6** | **P3 — Normal** | Sprint Review / Manual |

## 3. Expected Evidence
- Risk scoring matrix & CI execution tiering (`ACTIVITY.md`).
