# Module 4 — Activity 4.8: Continuous Monitoring & Observability

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Monitoring UI + Spring Boot Actuator + Audit Trail configured)

## 1. Objective
Monitor runtime health, API error states, calculation accuracy, anomaly volume, and tracked business entities (**invoices, line items, customers, products**) as required by Project P37 Phase 4.

## 2. Monitoring Implementation Across Full Stack
1. **Frontend QA & Monitoring Dashboard (`src/components/MonitoringView.tsx`)**:
   - Real-time 50-case GST benchmark accuracy (`100%`)
   - Anomaly recall monitor (`>=70%` target)
   - Tracked entity telemetry: **Invoices, Line Items, Customers, SKUs**
   - Production Backend status (`Connected`, `Last Synced`, or explicit error state)
   - Timestamped `Audit & Calculation Review Log`
2. **Backend Spring Boot Actuator (`application.properties`)**:
   - Exposes `/actuator/health`, `/actuator/info`, and `/actuator/metrics` (`http.server.requests` latency & error counts).
   - Structured HTTP error responses via `GlobalExceptionHandler.java`.

## 3. Expected Evidence
- `MonitoringView.tsx`, `application.properties`, `AuditLogController.java`.
- Live Monitoring Dashboard screenshot.
