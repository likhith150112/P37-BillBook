# Module 4 — Activity 4.5: AI-Generated Test Cases & Verification Datasets

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (50 GST test cases + 20 labeled anomaly cases + automated runner `datasets.test.ts` verified)

## 1. Objective
Use AI-assisted boundary-value & equivalence-partitioning generation paired with independent mathematical verification to create reusable test datasets for BillBook (`P37` target: 100% GST accuracy on 50 invoices, >=70% anomaly recall).

## 2. Generated Datasets & Verification
- `/tests/datasets/gst_50_test_invoices.json` & `.csv`: 50 unique invoice cases across all 5 GST slabs (`0%, 5%, 12%, 18%, 28%`), intra-state & inter-state, discounts (`0%–15%`), fractional unit prices, and nearest-rupee round-off.
- `/tests/datasets/anomaly_labeled_dataset.json` & `.csv`: 20 labeled invoices (`10 NORMAL`, `10 ANOMALY` spanning `ANOM_EXCESS_DISCOUNT`, `ANOM_GST_HSN_MISMATCH`, `ANOM_QTY_OUTLIER`, `ANOM_UNIT_PRICE_DROP`, `ANOM_ZSCORE_TOTAL`, `ANOM_DUPLICATE_INVOICE`).
- `/src/utils/datasets.test.ts`: Executes all 70 dataset rows deterministically in Node (`tsx --test`).

## 3. Expected Evidence
- Dataset files under `/tests/datasets/` + `src/utils/datasets.test.ts` test output (`50/50` GST pass, `100%` anomaly recall on injected cases, `0` false positives).
