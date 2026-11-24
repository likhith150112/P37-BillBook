# Module 4 — Activity 4.3: Integration Testing (Spring Boot + H2 + Anomaly + Categorisation)

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`BillBookIntegrationTest.java` & `api.test.ts` authored) | `PENDING` (Local Maven MockMvc run output)

## 1. Objective
Test multi-layer integration across Spring Boot Controllers, Services, JPA Repositories, MySQL-mode H2 database, GST `BigDecimal` calculation, Auto-Categorisation, Anomaly Detection, and Audit Trail persistence.

## 2. Implementation (`backend/src/test/java/com/billbook/BillBookIntegrationTest.java`)
End-to-end `@SpringBootTest` + `MockMvc` scenario verifying:
1. `POST /api/customers` creates customer in Karnataka.
2. `POST /api/products/suggest-category` returns HSN `8471`, `18%`, `advisoryOnly: true`.
3. `POST /api/products` saves product.
4. `POST /api/invoices` computes `INTRA_STATE` GST, triggers `ANOM_EXCESS_DISCOUNT` & `ANOM_GST_HSN_MISMATCH`, and returns `hasUnreviewedAnomalies: true`.
5. `PATCH /api/invoices/{id}/anomalies/review` persists reviewer note and sets `hasUnreviewedAnomalies: false`.
6. `PATCH /api/invoices/{id}/payment` transitions status to `PAID`.
7. `GET /api/reports/summary`, `/api/reports/hsn`, `/api/config/seller`, `/api/audit-logs` return persisted aggregates; `/api/invoices/999999` returns structured JSON `404 NOT_FOUND`.

## 3. Expected Evidence
- `BillBookIntegrationTest.java` and `src/services/api.test.ts`.
- Local `mvn test` console output (**PENDING** local execution).
