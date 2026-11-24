# Test & Quality Execution Results — Project P37 (BillBook)

This log separates **verified local executions** performed inside this workspace from **PENDING local-environment executions** that require JDK 17 + Maven, MySQL 8, Chrome/Selenium WebDriver, SonarQube, or Jenkins on your Windows/Linux machine.

---

## 1. Automated Verification Executed in Current Workspace (Node / Vite / Playwright)

*(All checks below ran cleanly after final code edits on 2026-11-24.)*

| Check | Command | Target | Actual Verified Result | Status |
|---|---|---|---|---|
| TypeScript & Build | `npm run lint` (`tsc --noEmit`) & `npm run build` | Zero compile errors | `tsc --noEmit` (0 errors) & `vite build` succeeded | **VERIFIED** |
| Unit, Dataset & Strict-API Tests | `npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts` | 100% GST on 50 cases; >=70% anomaly recall; API strict error check | **11 / 11 passed** (50/50 GST = 100%, 10/10 anomaly recall, 0 FP, strict `ApiError` verified) | **VERIFIED** |
| Defect Predictor Script (Activity 4.7) | `python3 docs/modules/module4/activity_4.7/defect_predictor.py` | Clean risk ranking across 10 modules | Executed cleanly; ranked `InvoiceBuilderView.tsx` (93.80 HIGH) top risk | **VERIFIED** |
| Headless Browser UI Verification | `playwright-cli` against `http://localhost:3000` | Preview/Production mode switch, 50-case QA check, mobile `390x844` layout, 0 console errors | All flows passed (`0` console errors/warnings; `0` mobile horizontal overflow; Production offline banner verified) | **VERIFIED** |


---

## 2. Local Environment Execution Templates (Status: PENDING Local Execution)

Run these commands using `WINDOWS_SETUP.md` / `scripts/windows/run-tests.ps1`, then fill in the **Actual Result**, **Date**, and **Evidence Path** columns honestly.

| Target Metric | Required Target | Command to Run Locally | Actual Result | Pass / Fail | Status | Evidence File / Screenshot |
|---|---|---|---|---|---|---|
| Backend JUnit 5 Suite (GST + Integration) | All JUnit tests pass | `cd backend && mvn test` | `_fill after run_` | `PENDING` | **PENDING** | `backend/target/surefire-reports/*.txt` |
| Backend JaCoCo Coverage | >= 80% instruction/line coverage | `cd backend && mvn verify` | `_fill % coverage_` | `PENDING` | **PENDING** | `backend/target/site/jacoco/index.html` |
| 50-Invoice GST Accuracy (Java BigDecimal) | 100% (50 / 50) | `cd backend && mvn -Dtest=GstCalculationServiceTest test` | `_fill X / 50_` | `PENDING` | **PENDING** | `backend/target/surefire-reports/com.billbook.GstCalculationServiceTest.txt` |
| Selenium POM E2E Browser Suite | All Selenium tests pass | `mvn test` in `tests/selenium` (with app running) | `_fill X / Y_` | `PENDING` | **PENDING** | `tests/results/selenium_report.txt` |
| SonarQube Static Analysis | 0 Blockers, 0 Criticals | `sonar-scanner` (after `mvn verify`) | `_fill blockers/criticals_` | `PENDING` | **PENDING** | `[Attach SonarQube Dashboard screenshot]` |
| GitHub Actions / Jenkins CI Pipeline | Green build on `main` | Push to GitHub / Trigger Jenkinsfile | `_fill build URL_` | `PENDING` | **PENDING** | `[Attach CI badge / build log]` |
| Manual Test Checklist (`MTC-01..MTC-15`) | 15 / 15 passed | Human walkthrough on running app | `_fill X / 15_` | `PENDING` | **PENDING** | `tests/manual/MANUAL_TEST_CASES.md` |
