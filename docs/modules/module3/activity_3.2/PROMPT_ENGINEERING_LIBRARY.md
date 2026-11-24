# BillBook (P37) Prompt Engineering Library (3 Rated Variants)

## Variant 1 — Zero-Shot Naive Prompt (Baseline — Rated 2.4 / 5)
**Prompt**:
> "Write a Java service for BillBook that detects anomalies in invoices and fixes wrong GST rates."

**Observed Problems**:
- Missing `BigDecimal` / paise thresholds.
- Generated unsafe auto-mutation that silently rewrote user GST rates ("fixed wrong GST rates").
- No structured `ruleCode`, `metricValue`, or `baselineValue` fields for frontend rendering.

**Rating**: Accuracy `2/5` · Safety `1/5` · Reusability `3/5` -> **2.4 / 5 (Rejected for financial software)**

---

## Variant 2 — Role + Constraints Prompt (Improved — Rated 4.1 / 5)
**Prompt**:
> "Act as a senior Spring Boot fintech engineer. Write `AnomalyDetectionService.java` for Indian GST billing. Never mutate invoice totals, prices, or tax rates. Return read-only `AnomalyAlert` records with severity (`LOW`, `MEDIUM`, `HIGH`), `metricValue`, `baselineValue`, and plain-English explanation for shop owners."

**Observed Outcome**:
- Preserved read-only invariant (`List<AnomalyAlert>`).
- Produced clean `ANOM_EXCESS_DISCOUNT` (>25%) and `ANOM_DUPLICATE_INVOICE` rules.
- Needed one follow-up refinement for small historical sample size (`totals.size() >= 4` guard on Z-score standard deviation).

**Rating**: Accuracy `4/5` · Safety `5/5` · Reusability `4/5` -> **4.1 / 5 (Adopted with unit tests)**

---

## Variant 3 — Schema-Driven Deterministic Contract Prompt (Best — Rated 4.8 / 5)
**Prompt**:
> "Using our MySQL DDL (`invoice_items`, `anomaly_alerts`) and TypeScript interface `CalculatedLineItem`, implement `GstCalculationService` (Java 17, `BigDecimal`, `RoundingMode.HALF_UP`) and `AutoCategorisationService` (`advisoryOnly=true`). Support only slabs `{0, 5, 12, 18, 28}`. Populate `cgstRate`, `sgstRate`, `igstRate` identically to `src/utils/gstCalculator.ts`, and verify against 50 intra-state and inter-state cases."

**Observed Outcome**:
- Zero schema/DTO drift between Java entities and TypeScript interfaces.
- Deterministic 100% match across all 50 benchmark test cases (`GstCalculationServiceTest` + `datasets.test.ts`).

**Rating**: Accuracy `5/5` · Safety `5/5` · Reusability `4.5/5` -> **4.8 / 5 (Standard P37 Template)**
