# Module 1 — Activity 1.5: AI-Assisted Code Generation & Human Review Log

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Starter + full-stack Spring Boot, MySQL, and React code generated and audited)

## 1. Objective
Generate full-stack starter and production code for BillBook using AI assistance, then inspect every backend and frontend file to eliminate bugs, schema mismatches, and unsafe defaults.

## 2. Procedure
1. Generate MySQL DDL (`database/schema.sql`), Spring Boot layers (`model`, `repository`, `service`, `controller`, `dto`, `config`), and React UI (`src/components`, `src/utils`).
2. Perform a file-by-file technical review against P37 correctness criteria.
3. Fix every defect before integration testing.

## 3. Concrete Defects Caught & Fixed During Human Review
1. **`LazyInitializationException` under `open-in-view=false`**: `Invoice.items` and `Invoice.anomalies` originally defaulted to `FetchType.LAZY` without `@Transactional(readOnly = true)` in `InvoiceService`. Fixed by adding `@Fetch(FetchMode.SUBSELECT)` + transactional read boundaries.
2. **DTO Contract Mismatches**: Added `cgstRate`, `sgstRate`, `igstRate` to `InvoiceItem` and `hasUnreviewedAnomalies` JSON getter to `Invoice` so Spring Boot responses match TypeScript `Invoice` types 1:1.
3. **Missing Persistence Endpoints**: Added `GET /api/invoices/{id}`, `PATCH /api/invoices/{id}/anomalies/review`, `POST /api/invoices/check-anomalies`, `GET /api/reports/hsn`, `GET /api/config/seller`, `AuditLogController`, and `GlobalExceptionHandler`.
4. **Mode Isolation**: Enforced zero silent mock fallback when running in Production Mode (`src/services/api.ts` & `src/App.tsx`).

## 4. Expected Evidence
- Full source tree under `src/`, `backend/src/`, and `database/`.
- Technical audit items verified in `src/services/api.test.ts` and `backend/src/test/java/com/billbook/BillBookIntegrationTest.java`.
