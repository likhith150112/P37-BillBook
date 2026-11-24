# Software Requirements Specification (SRS v2 — Human-Corrected)
## Project P37: BillBook — Invoice and GST Billing Software

## 1. Corrections Applied Over SRS v1
1. **Removed Hallucinated Scope**: Removed live GSTN Government Portal / e-Way Bill API submission; replaced with offline **GSTR-1 HSN Summary Table 12 & CSV Export**.
2. **Deterministic Tax Invariant**: Replaced "AI tax calculation" with strict `BigDecimal` (`RoundingMode.HALF_UP`) rule-based math covering GST slabs `0%, 5%, 12%, 18%, 28%` and nearest-rupee invoice round-off.
3. **Human-in-the-Loop AI**: Auto-categorisation and anomaly detection are strictly **advisory** (`advisoryOnly = true`); users must explicitly review/apply suggestions and confirm flagged anomalies.
4. **Mode Separation**: Separated **Preview Mode (Synthetic `localStorage`)** from **Production Mode (Spring Boot REST API + MySQL)** with zero silent fallback.

## 2. Functional Requirements (FR)
- **FR-01 Business Dashboard**: Display Total Revenue, Invoice Count, GST Collected (CGST+SGST vs IGST), Pending Receivables, monthly chart, and recent invoices.
- **FR-02 Customer Directory**: Create, edit, delete, and search B2B (15-character GSTIN validated) and B2C customers; determine Intra-State vs Inter-State supply from customer state vs seller state (`Karnataka`).
- **FR-03 Product & HSN Catalog**: Manage SKUs, HSN/SAC codes, unit prices (>0), stock quantity, and GST slabs (`0, 5, 12, 18, 28`). Provide advisory rule-based auto-categorisation (`POST /api/products/suggest-category`).
- **FR-04 Multi-Line GST Invoice Builder**: Support multiple products, quantity >= 1, line discount 0–100%, automatic gross/discount/taxable/CGST/SGST/IGST/round-off/grand-total calculation.
- **FR-05 Intelligent Anomaly Detection**: Screen candidate invoices before saving across 6 explainable rules:
  1. `ANOM_EXCESS_DISCOUNT` (>25%)
  2. `ANOM_GST_HSN_MISMATCH` (rate differs from HSN standard slab)
  3. `ANOM_QTY_OUTLIER` (quantity >= 40 units)
  4. `ANOM_UNIT_PRICE_DROP` (>=40% below catalog list price)
  5. `ANOM_ZSCORE_TOTAL` (statistical outlier >= 2.0 sigma or >= 2.75x mean)
  6. `ANOM_DUPLICATE_INVOICE` (same customer & total within 3 days)
- **FR-06 Invoice History, Payment & Anomaly Audit**: Filter by status (`PAID`, `PENDING`, `PARTIAL`, `OVERDUE`, `FLAGGED`), record partial/full payments (`PATCH /api/invoices/{id}/payment`), and mark anomalies reviewed with mandatory reviewer note (`PATCH /api/invoices/{id}/anomalies/review`).
- **FR-07 Printable & PDF Tax Invoices**: Render A4 GST Tax Invoice modal and export downloadable PDF (`jsPDF`).
- **FR-08 Sales & GSTR-1 Reports**: Aggregate HSN-wise summary (`GET /api/reports/hsn`), B2B vs B2C breakup, customer revenue ranking, and CSV exports.
- **FR-09 Monitoring & QA Dashboard**: Run 50-case deterministic GST accuracy verification, track anomaly detection recall (>=70% target), display entity counts, and inspect `audit_logs`.

## 3. Non-Functional Requirements (NFR)
- **NFR-01 Financial Accuracy**: 100% pass rate across the 50 GST test invoice benchmark (`gst_50_test_invoices.json`).
- **NFR-02 Anomaly Recall**: >= 70% detection recall on injected test anomalies (`anomaly_labeled_dataset.json`).
- **NFR-03 Test Coverage & Quality**: >= 80% backend JaCoCo instruction coverage; 0 SonarQube blocker/critical issues.
- **NFR-04 Responsiveness**: Usable on desktop (>=1280px) and mobile (`390x844`) viewports without horizontal page overflow.
- **NFR-05 Data Privacy**: Seed datasets and previews contain synthetic names, emails (`*.example`), and sample GSTINs only.
