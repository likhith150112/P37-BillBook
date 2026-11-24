# Module 2 — Activity 2.7: Jira-Importable CSV & AI Tools for Agile Planning

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`billbook_jira_import.csv` authored & validated) | `PENDING` (Live Jira Cloud import screenshot)

## 1. Objective
Generate a clean **Jira-importable CSV file** containing all 25 BillBook user stories across Epics and Sprints 1–2, and evaluate AI tools for Agile backlog management.

## 2. Included Artifact
- `billbook_jira_import.csv` — Formatted for Jira **System -> External System Import -> CSV** (`Issue Type`, `Summary`, `Description`, `Priority`, `Story Points`, `Sprint`, `Epic Name`, `Labels`, `Acceptance Criteria`).

## 3. AI Tools for Agile Planning Rating (1–5)

| Tool / Feature | Use Case in BillBook | Rating (/5) | Key Caveat |
|---|---|---|---|
| **Atlassian Intelligence (Jira)** | Splitting Epics into Sub-tasks & summarizing Sprint issues | 4.2 | Requires human verification on GST technical dependencies |
| **ChatGPT / LLM Backlog Generator** | Generating structured GIVEN/WHEN/THEN & Jira CSV | 4.5 | Tends to pad story count unless constrained to P37 scope |
| **Linear / GitHub Projects AI** | Linking PR branches (`feature/BB-xx`) directly to Sprint board | 4.3 | Best developer ergonomics alongside GitHub Actions CI |

## 4. Expected Evidence
- `billbook_jira_import.csv` inside this directory.
- Jira Sprint Board & Burndown Chart screenshots after importing CSV locally (**PENDING** Jira account import).
