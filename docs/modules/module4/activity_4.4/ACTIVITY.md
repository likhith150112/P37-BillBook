# Module 4 — Activity 4.4: Selenium Browser Testing (Page Object Model)

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Selenium 4 POM suite authored under `/tests/selenium/`) | `PENDING` (Local Chrome + Selenium execution screenshot)

## 1. Objective
Automate end-to-end browser journeys across **BillBook** using the **Page Object Model (POM)** design pattern in Selenium 4 + JUnit 5.

## 2. Implementation (`/tests/selenium/`)
- `pom.xml`: Selenium Java `4.27.0` + JUnit 5 `5.11.3`.
- `BillBookPages.java`: Encapsulates `WebDriverWait` interactions across:
  - `open(baseUrl)` (verifies Dashboard renders)
  - `createCustomer(...)`
  - `testAutoCategoriseProduct(...)`
  - `createInvoiceAndReturnGrandTotal(...)` (including anomaly confirmation checkbox)
  - `runMonitoringBenchmark()` (verifies `50 / 50 deterministic assertions passed`)
- `BillBookSeleniumTest.java`: Headless/headed Chrome tests configurable via `BILLBOOK_URL` and `SELENIUM_HEADLESS`.

## 3. Expected Evidence
- `/tests/selenium/` source files.
- Local `mvn test` execution report inside `tests/selenium/` (**PENDING** local Chrome run).
