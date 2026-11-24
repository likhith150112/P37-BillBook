# Module 2 — Activity 2.3: Product Backlog & 25 User Stories

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`PRODUCT_BACKLOG_25_STORIES.md` authored with acceptance criteria & Definition of Done)

## 1. Objective
Author at least 20 prioritized, INVEST-compliant User Stories for **Shop Owners** and **Accountants** with testable Given/When/Then acceptance criteria, story points, and Definition of Done.

## 2. Artifacts Included
- `PRODUCT_BACKLOG_25_STORIES.md` — 25 complete BillBook user stories across 5 Epics (`EP-1` Foundation & Masters, `EP-2` GST Billing Core, `EP-3` Auto-Categorisation & Anomaly Detection, `EP-4` Ledger/PDF/Reports, `EP-5` QA/CI/Deployment).

## 3. Definition of Done (DoD)
1. Code compiles with zero TypeScript (`tsc --noEmit`) and Java Maven errors.
2. Financial calculations remain strictly deterministic (`BigDecimal HALF_UP` / `round2`).
3. Unit/integration tests pass with zero silent mock fallback in Production Mode.
4. Responsive UI verified on desktop and mobile viewports (`>=1280px` & `390px`).
