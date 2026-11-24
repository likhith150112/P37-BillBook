# Module 2 — Activity 2.6: AI-Assisted Story Estimation vs Planning Poker

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Comparative estimation table for Sprint 1 & Sprint 2) | `PENDING` (Live team Planning Poker session sign-off if conducted with classmates)

## 1. Objective
Compare **AI-assisted Fibonacci story-point estimation** against **human Planning Poker** estimates across key BillBook stories and inspect reasons for variance.

## 2. Estimation Comparison Matrix

| Story ID | Story Summary | AI Estimate (Fibonacci) | Human / Team Estimate | Variance Reason | Final Committed Points |
|---|---|---|---|---|---|
| BB-06 | Multi-Line Invoice Builder | 3 | **5** | AI underestimated React controlled-row state sync & live anomaly re-evaluation | **5** |
| BB-07 | Deterministic CGST + SGST Split | 3 | **5** | Required syncing both `BigDecimal` Java & TS math + 50-case edge rounding | **5** |
| BB-11 | MySQL Schema & Spring Boot JPA | 3 | **5** | Required handling `FetchMode.SUBSELECT` under `open-in-view=false` | **5** |
| BB-13 | Advisory Auto-Categorisation | 5 | **5** | Strong consensus on HSN keyword dictionary + `advisoryOnly` UI workflow | **5** |
| BB-17 | Z-Score & Duplicate Detection | 3 | **5** | Edge cases around small invoice history (`<4` invoices) & 3-day window | **5** |
| BB-20 | A4 PDF Invoice Export (`jsPDF`) | 5 | **3** | Reusable print layout & tabular `autoTable`/line helper reduced effort | **3** |
| BB-23 | Strict Preview/Production Isolation | 2 | **3** | Error banner + retry + empty-state handling required explicit API tests | **3** |

## 3. Key Takeaway
AI consistently underestimated **cross-layer integration complexity** (React + Spring Boot DTO alignment and JPA lazy-loading traps) by 1 Fibonacci step; human Planning Poker corrected capacity planning to a realistic **34 pts (Sprint 1) + 32 pts (Sprint 2)**.

## 4. Expected Evidence
- Comparison table (`ACTIVITY.md`) + live Planning Poker card round notes (**PENDING** class session).
