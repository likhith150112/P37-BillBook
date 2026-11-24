# Academic Integrity & AI Usage Disclosure — Project P37

**Course:** AI in Software Engineering (Integrated Project)  
**Project ID & Title:** P37 — BillBook: Invoice and GST Billing Software  
**Student Roll Number:** 37  
**Repository:** `P37-BillBook`

---

## 1. Statement of Disclosure

In accordance with the *AI in Software Engineering* course guidelines, AI coding assistance was used throughout the lifecycle of **Project P37 (BillBook)** for requirements structuring, boilerplate generation, React + Spring Boot + MySQL code scaffolding, synthetic test dataset construction, CI/CD workflow templates, and academic module documentation (`docs/modules/module1` through `module5`).

All generated code, financial formulas, test assertions, and architectural configurations were reviewed, audited, debugged, and selectively modified by the student author before inclusion in this repository.

---

## 2. Core Engineering & Financial Safeguards

1. **Deterministic Financial Engine (No AI Mutation):**
   - Invoice line totals, discounts, intra-state CGST + SGST splits, inter-state IGST, round-off adjustments, and grand totals are computed exclusively by deterministic code:
     - Java Backend: `com.billbook.service.GstCalculationService` using `java.math.BigDecimal` with `RoundingMode.HALF_UP`.
     - TypeScript Frontend: `src/utils/billing.ts` (`round2`, `calculateInvoiceTotals`).
   - AI/heuristic features (item auto-categorisation and anomaly detection) operate strictly in an **advisory, human-in-the-loop** capacity and never silently overwrite monetary totals or GST rates.

2. **Strict Environment Mode Isolation:**
   - **Preview Mode** uses explicitly labeled synthetic demonstration data persisted in browser `localStorage` so the React interface can be inspected without a local JVM/MySQL runtime.
   - **Production Mode** communicates exclusively with the Spring Boot REST API (`/api/*`) backed by MySQL 8 and throws an explicit user-visible error banner if the backend is offline—never falling back silently to synthetic data.

3. **Synthetic Data & Zero-Secret Hygiene:**
   - Every customer name, GSTIN, address, phone number, email, and invoice in `src/data/mockData.ts`, `database/seed.sql`, and `tests/datasets/*` is 100% synthetic.
   - No live API keys, production passwords, or private tokens are stored in source files, `.env.example`, or Docker configs.

4. **Verification Honesty:**
   - Checks executed in this container (`tsc --noEmit`, `vite build`, 11/11 Node `tsx --test` assertions covering the 50 GST invoices and 20 labeled anomaly cases, `defect_predictor.py`, and headless Playwright UI checks) are reported as **Verified**.
   - Local-machine steps requiring JDK 17 + Maven, MySQL 8, Google Chrome WebDriver, SonarQube, or Jenkins (`mvn verify`, JaCoCo >=80% gate, Selenium E2E, SonarQube scan, CI pipeline badges, and manual checklist sign-off) are explicitly marked **PENDING** until executed locally via `WINDOWS_SETUP.md`.
