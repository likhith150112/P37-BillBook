# Module 1 — Activity 1.6: Requirements-Based Testing

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Traceability Matrix + automated TypeScript & Java requirements tests authored)

## 1. Objective
Derive explicit verification test cases directly from `SRS_v2_Human_Corrected.md` (`FR-01` through `FR-09`, `NFR-01` through `NFR-05`) establishing 100% requirements traceability.

## 2. Requirements Traceability Matrix (RTM)

| Req ID | Requirement Summary | Verification Method | Linked Automated / Manual Test |
|---|---|---|---|
| FR-01 | Business Dashboard KPIs & charts | UI Inspection + Manual | `MTC-02` + Playwright dashboard check |
| FR-02 | Customer CRUD & B2B GSTIN / State classification | Integration + Unit + UI | `BillBookIntegrationTest`, `determineSupplyType` in `billing.test.ts`, `MTC-03/04` |
| FR-03 | Product & HSN Catalog + Advisory Auto-Categorisation | JUnit + TS Unit + Integration | `AnomalyAndCategorisationTest`, `billing.test.ts`, `MTC-05` |
| FR-04 | Multi-item GST calculation (`CGST/SGST/IGST` + round-off) | BigDecimal + TS Unit + 50-Case Dataset | `GstCalculationServiceTest`, `datasets.test.ts`, `MTC-06/07/08` |
| FR-05 | Explainable Anomaly Screening (6 rules) | Unit + Dataset + Integration | `datasets.test.ts` (20 labeled cases), `BillBookIntegrationTest`, `MTC-09/10` |
| FR-06 | Payment ledger & human anomaly audit persistence | Integration + Manual | `BillBookIntegrationTest`, `MTC-11/12` |
| FR-07 | Printable & downloadable A4 PDF Tax Invoice | UI Modal + Manual | `pdfExport.ts`, `MTC-13` |
| FR-08 | Sales & GSTR-1 HSN Summary Table 12 CSV | Unit + Integration + Manual | `aggregateHsnSummary` in `billing.test.ts`, `/api/reports/hsn`, `MTC-14` |
| FR-09 | Monitoring & QA 50-case verifier + Audit trail | UI + API + Integration | `MonitoringView.tsx`, `/api/audit-logs`, `BillBookSeleniumTest` |
| NFR-01 | 100% GST accuracy on 50 test invoices | Automated Dataset Test | `tests/datasets/gst_50_test_invoices.json` (`datasets.test.ts`, `GstCalculationServiceTest`) |
| NFR-02 | >=70% injected anomaly detection recall | Automated Dataset Test | `tests/datasets/anomaly_labeled_dataset.json` (`datasets.test.ts`) |

## 3. Expected Evidence
- Traceability Matrix (`ACTIVITY.md`)
- `src/utils/billing.test.ts`, `src/utils/datasets.test.ts`, `backend/src/test/java/com/billbook/BillBookIntegrationTest.java`, `tests/manual/MANUAL_TEST_CASES.md`.
