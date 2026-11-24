# Module 2 — Activity 2.1: Agile Values & Principles Mapping

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Agile Manifesto & 12 principles mapped to BillBook)

## 1. Objective
Map the 4 Agile Manifesto values and 12 Agile Principles directly to engineering decisions in **BillBook** (`P37`).

## 2. Four Core Values Applied to BillBook

| Agile Value | How Applied in BillBook (P37) |
|---|---|
| **Individuals & interactions** over processes & tools | Weekly role-play reviews with Shop Owner & Accountant personas to verify counter checkout speed and GST clarity before locking UI layouts. |
| **Working software** over comprehensive documentation | Delivered runnable Preview Mode + Spring Boot REST endpoints in two 1-week sprints ahead of final academic report compilation. |
| **Customer collaboration** over contract negotiation | Iterative feedback on anomaly explanations (`ANOM_EXCESS_DISCOUNT`, `ANOM_GST_HSN_MISMATCH`) so SME owners understand why an invoice is flagged. |
| **Responding to change** over following a plan | Added strict Production vs Preview mode isolation and `AuditLog` persistence when real integration requirements expanded beyond static mockups. |

## 3. Selected Agile Principles Alignment
1. **Early & continuous delivery** -> Sprint 1 ships Customer/Product CRUD + GST Invoice core; Sprint 2 adds Anomaly Detection + Auto-Categorisation + Reports.
2. **Welcome changing requirements** -> Modular service boundaries (`GstCalculationService`, `AnomalyDetectionService`) isolate tax changes cleanly.
3. **Working software is primary measure** -> Verified via 11/11 TypeScript unit tests and Spring Boot H2 integration tests.
4. **Technical excellence & good design** -> `BigDecimal HALF_UP` precision, zero silent mock fallback, and >=80% JaCoCo gate.
5. **Simplicity** -> Deterministic rule-based HSN/anomaly checks avoid opaque black-box ML complexity for small shops.

## 4. Expected Evidence
- Value & Principle mapping table recorded in `ACTIVITY.md`.
