# Module 3 — Activity 3.8: Benefits & Challenges of AI-Assisted Development

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Reflect on engineering productivity gains and risks encountered across Module 3 implementation, CI/CD, and containerization.

## 2. Summary Evaluation

| Category | Benefits Experienced | Technical Challenges Solved |
|---|---|---|
| **Rapid Full-Stack Delivery** | React UI, Spring Boot REST controllers, MySQL DDL, and Dockerfiles generated cleanly in cohesive iterations. | Required strict human verification of Hibernate `SUBSELECT` fetching, Nginx `/api/` proxy routing, and CORS origins. |
| **Prompt-Driven Refactoring** | Schema-driven prompts (`Variant 3`) kept TS types and Java DTOs closely aligned. | Naive prompts (`Variant 1`) attempted to auto-overwrite GST slabs; prevented by explicit read-only constraints. |
| **CI/CD & DevOps** | GitHub Actions, Jenkinsfile, and PowerShell Windows automation lower onboarding friction for evaluators. | Required removing duplicate/missing scripts and ensuring no secrets leaked into `.env.example` or Docker Compose. |

## 3. Expected Evidence
- Comparative analysis table in `ACTIVITY.md`.
