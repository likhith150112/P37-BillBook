# Module 2 — Activity 2.4: Kanban Board & WIP Limits

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Kanban workflow policy, WIP limits, and Sprint 2 snapshot documented)

## 1. Objective
Configure a visual Kanban workflow with explicit Work-In-Progress (**WIP**) limits to prevent multitasking bottlenecks during BillBook Sprint 1 & Sprint 2 delivery.

## 2. Kanban Board Structure & WIP Limits

| Column | WIP Limit | Entry Rule | Exit Rule |
|---|---|---|---|
| **Backlog** | Unlimited | Story follows INVEST template | Refined & estimated for Sprint |
| **Ready / To Do** | **5 items** | Acceptance criteria + API contract defined | Developer pulls work |
| **In Progress (Dev)** | **2 items** | Branch `feature/<story-id>` created from `main` | Unit tests pass locally |
| **Code Review & QA** | **2 items** | PR opened; AI + static checks attached | Zero blockers; PR approved |
| **Done** | Unlimited | Merged to `main`; CI green; DoD met | Verified in UI + ledger |

## 3. Cumulative Flow Policy & Bottleneck Mitigation
- Whenever **Code Review & QA** hits WIP limit `2/2`, no new feature branches are pulled from **Ready** until open PRs are reviewed and merged.
- Financial calculation changes (`gstCalculator.ts`, `GstCalculationService.java`) automatically require verification against all 50 test invoices before leaving **In Progress**.

## 4. Expected Evidence
- WIP limit policy & Kanban board definition (`ACTIVITY.md`).
- Live Jira / Trello Kanban board screenshot (`PENDING` local board export).
