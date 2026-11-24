# Module 1 — Activity 1.1: Software Process Model Comparison & Selection

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Documentation & P37 justification finalized)

## 1. Objective
Compare classic SDLC process models (Waterfall, Incremental, Spiral, Prototyping, V-Model) and select the optimal hybrid methodology for **BillBook**, accounting for strict Indian GST rules and SME shop usability requirements.

## 2. Procedure
1. Analyze domain constraints of P37: fixed Indian GST tax rules (`CGST/SGST/IGST` slabs 0%, 5%, 12%, 18%, 28%) paired with evolving UI/anomaly-explanation requirements for shop owners and accountants.
2. Score 5 process models across requirement volatility, early customer feedback, risk control, and testing rigor.
3. Document justified selection and Phase 1–5 alignment.

## 3. Process Model Comparison Matrix

| Criterion | Waterfall | Incremental | Spiral | Prototyping | V-Model |
|---|---|---|---|---|---|
| Requirement Flexibility | Low | High | High | Very High | Low |
| Early Working Software | Late (end) | High (per increment) | Medium | Very High (UI mockups) | Late |
| Financial Risk Management | Low | Medium | High | Low | Medium |
| Verification Rigor | Medium | Medium-High | High | Low | Very High |
| Fit for BillBook (P37) | Poor | **Strong (Core Build)** | Moderate | **Strong (5-Screen UI)** | **Strong (GST Verification)** |

## 4. Selected Process Model for BillBook
**Incremental + Prototyping + V-Model Verification (Hybrid Agile-V)**:
- **Prototyping** validates the 5 core SME screens early (Dashboard, Customers, Products/HSN, Invoice Builder, Reports/Print).
- **Incremental Delivery** splits MVP into Sprint 1 (Customer/Product CRUD + Deterministic GST Billing) and Sprint 2 (Advisory Auto-Categorisation + Anomaly Detection + PDF/Reports).
- **V-Model Discipline** pairs every GST requirement directly to deterministic BigDecimal unit assertions and the 50-invoice verification benchmark.

## 5. Expected Evidence
- Comparison matrix & justified selection in this document (`ACTIVITY.md`).
- Stakeholder role-play interview notes template (`../activity_1.4/ACTIVITY.md`) — **[PENDING live human sign-off if conducted in class]**.
