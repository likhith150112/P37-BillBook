# Module 2 — Activity 2.8: Benefits & Challenges of AI-Assisted Agile

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Synthesize real benefits and operational challenges observed while applying AI assistance across Agile planning, estimation, backlog authoring, and Sprint execution on **BillBook**.

## 2. Synthesis Matrix

| Dimension | Concrete Benefits Observed in P37 | Challenges & Risks Observed | Control Applied in BillBook |
|---|---|---|---|
| **Backlog & Acceptance Criteria** | Drafted 25 structured stories + Jira CSV in <30 minutes | Generic AI output included out-of-scope features (live GSTN portal filing) | Human PO pruned scope in `SRS_v2_Human_Corrected.md` |
| **Estimation** | Fast baseline breakdown of CRUD vs Tax Engine complexity | AI underestimated JPA/DTO serialization & React state coupling | Planning Poker calibrated Sprint 1/2 points (`BB-06`, `BB-11`, `BB-17`) |
| **Sprint Execution (XP/TDD)** | Rapid scaffolding of JUnit 5 & `node:test` test harnesses | Risk of subtle rounding differences between TS float and Java `BigDecimal` | Shared 50-invoice benchmark enforced identical expected totals |
| **Kanban Flow & Review** | Faster boilerplate frees developer time for domain modeling | Higher PR volume can overload **Code Review & QA** column | Enforced Kanban WIP limit of **2** items in Dev & **2** in Review |

## 3. Expected Evidence
- Analytical reflection documented in `ACTIVITY.md`.
