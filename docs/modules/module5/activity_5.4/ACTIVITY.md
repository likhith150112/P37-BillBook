# Module 5 — Activity 5.4: AI-Assisted Code Review vs Static Analysis vs Human Review

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Conduct a three-way review (**Human Reviewer**, **AI Code Reviewer**, **Static Type/Linter & SonarQube Rules**) specifically on BillBook's **Anomaly Detection (`AnomalyDetectionService.java`, `anomalyDetector.ts`)** and **Auto-Categorisation (`AutoCategorisationService.java`, `categorizer.ts`)** modules.

## 2. Three-Way Code Review Findings Comparison

| Finding ID | Module Reviewed | Detected By | Issue Description | Resolution Applied |
|---|---|---|---|---|
| CR-01 | `AnomalyDetectionService.java` | **Human + AI** | Z-score division by zero or noisy alerts when `< 4` historical invoices exist. | Guarded with `if (totals.size() >= 4)` and `std > 0 ? ... : 0`. |
| CR-02 | `InvoiceService.java` | **Human Review** | `spring.jpa.open-in-view=false` caused `LazyInitializationException` serializing `Invoice.items` & `anomalies`. | Added `@Fetch(FetchMode.SUBSELECT)` and `@Transactional(readOnly = true)`. |
| CR-03 | `src/services/api.ts` | **Human Review** | Need strict guarantee Production Mode never falls back to synthetic data on fetch error. | Enforced `throw new ApiError(...)` + `src/services/api.test.ts` proof. |
| CR-04 | `GstCalculationService.java` | **Static / AI** | Possible `NullPointerException` if `LineItemInput.unitPrice` or `gstRate` is missing in JSON payload. | Added `@NotNull` DTO validation + explicit `ALLOWED_GST_SLABS` guard. |
| CR-05 | `ProductsView.tsx` | **AI Review** | `Auto-Categorise Item` was running only client-side rules even in Production Mode. | Wired `onSuggestCategory` prop calling `POST /api/products/suggest-category`. |

## 3. Expected Evidence
- Multi-reviewer findings comparison table (`ACTIVITY.md`) and `/AI_Usage_Log.md`.
