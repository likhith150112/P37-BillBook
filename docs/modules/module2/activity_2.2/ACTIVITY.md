# Module 2 — Activity 2.2: Scrum Framework, Roles & Sprint Planning

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Scrum roles, Sprint 1 & Sprint 2 plans, and DoD authored) | `PENDING` (Live team stand-up / retrospective signatures if run with peers)

## 1. Objective
Organize **BillBook** into two 1-week Scrum sprints with rotating Scrum roles, explicit Sprint Goals, and Definition of Done (`DoD`).

## 2. Rotating Scrum Roles Chart

| Role | Sprint 1 Assignee (Invoice & GST Core) | Sprint 2 Assignee (Anomaly, Categorisation & Reports) | Core Responsibility |
|---|---|---|---|
| **Product Owner** | Roll No. 37 (Student Lead — Accountant Persona) | Peer / Student Role-Play (Shop Owner Persona) | Prioritizes backlog, validates GST/GSTR-1 acceptance criteria |
| **Scrum Master** | Peer / Student Co-Reviewer | Roll No. 37 | Facilitates daily stand-up, enforces Kanban WIP limits, removes blockers |
| **Developers & QA** | Roll No. 37 | Roll No. 37 | Implements Spring Boot, MySQL, React, JUnit 5, and Selenium POM tests |

## 3. Sprint Plan Summary (Two 1-Week Sprints per P37 Handbook)
- **Sprint 1 Goal — Core Billing & Deterministic GST**: Deliver MySQL schema (`customers`, `products`, `invoices`, `invoice_items`), Spring Boot GST `BigDecimal` calculator, Customer & Product CRUD, Multi-Line Invoice Builder, and 50-case GST benchmark (Stories `BB-01`..`BB-12`, 34 Story Points).
- **Sprint 2 Goal — Intelligent Screening, Categorisation & Reporting**: Deliver Advisory Auto-Categorisation (`POST /api/products/suggest-category`), 6-Rule Anomaly Detection (`>=70%` recall), Payment & Audit Review Ledger, A4 PDF export, GSTR-1 HSN CSV reports, and QA Monitoring Dashboard (Stories `BB-13`..`BB-25`, 32 Story Points).

## 4. Expected Evidence
- Sprint 1 & 2 plan tables (`ACTIVITY.md`) and `../activity_2.3/PRODUCT_BACKLOG_25_STORIES.md`.
- Live stand-up / review / retrospective attendance log (**PENDING** live human session sign-off).
