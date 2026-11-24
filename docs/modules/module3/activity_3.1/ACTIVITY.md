# Module 3 — Activity 3.1: AI-Assisted Development Diary & Suggestion Log

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Maintain a chronological engineering diary documenting how AI suggestions were generated, evaluated, modified, or rejected while building BillBook's GST Engine, Advisory Categoriser, Anomaly Detector, and Spring Boot REST API.

## 2. Development Diary Entries & Suggestion Outcomes

| Date / Session | Feature Area | Prompted Task | AI Suggestion Summary | Human Decision & Fix Applied |
|---|---|---|---|---|
| Day 1 | MySQL + JPA Entities | Generate `Invoice` & `InvoiceItem` JPA entities | Created `Invoice` with `@OneToMany` lazy relations | **Modified**: Added `@Fetch(FetchMode.SUBSELECT)` & `cgstRate`/`sgstRate`/`igstRate` so Jackson does not fail with `LazyInitializationException` under `open-in-view=false`. |
| Day 2 | GST `BigDecimal` Engine | Write intra/inter-state GST calculator | Computed tax using `double` arithmetic in early snippet | **Rejected `double`, Enforced `BigDecimal`**: Enforced `RoundingMode.HALF_UP` scale 2 + explicit slab check (`0, 5, 12, 18, 28`). |
| Day 3 | Auto-Categorisation | Build product HSN & GST auto-mapper | Suggested auto-overwriting category/GST rate on product save | **Modified**: Added `advisoryOnly = true` flag + confidence + keyword explanation requiring explicit `Apply Suggestion` click. |
| Day 4 | Anomaly Detection | Implement statistical & rule screening | Suggested silently auto-correcting discounts >25% | **Rejected Silent Mutation**: Built explainable alert modal (`ANOM_*` rule codes) blocking save until user checks confirmation box. |
| Day 5 | React <-> Spring Integration | Connect React frontend to Spring Boot API | Generated `catch { return INITIAL_CUSTOMERS }` silent fallback | **Rejected Silent Fallback**: Added strict `ApiError` banner with **Retry Connection** and **Switch to Preview Mode** controls. |

## 3. Expected Evidence
- Chronological log above (`ACTIVITY.md`) and `/AI_Usage_Log.md`.
