# Module 4 — Activity 4.1: Manual vs Automated Testing

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Test suites & 15 manual cases authored) | `PENDING` (Human execution log for `MTC-01..MTC-15`)

## 1. Objective
Compare manual exploratory & checklist testing against automated testing (`node:test`, JUnit 5, MockMvc, Selenium POM) across all BillBook billing workflows.

## 2. Comparison Matrix

| Aspect | Manual Testing (`/tests/manual/MANUAL_TEST_CASES.md`) | Automated Testing (`billing.test.ts`, `datasets.test.ts`, JUnit 5, Selenium) |
|---|---|---|
| Best Applied To | A4 PDF visual alignment, mobile drawer ergonomics, human readability of anomaly text (`MTC-13`, `MTC-15`) | 50 GST calculation permutations, rounding boundaries, 20 anomaly recall cases, API contract checks |
| Repeatability | Medium (human fatigue across 50 tax rows) | 100% deterministic in `<1s` (Node) / `<10s` (Maven) |
| CI Integration | Manual sign-off template | Runs automatically on every GitHub Actions & Jenkins push |

## 3. Expected Evidence
- 15 structured manual cases in `/tests/manual/MANUAL_TEST_CASES.md` (**PENDING** local human execution screenshots).
- Executed TypeScript unit suites (`billing.test.ts`, `datasets.test.ts`, `api.test.ts`).
