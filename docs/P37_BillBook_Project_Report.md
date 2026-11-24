# Project Report: P37 — BillBook: Invoice and GST Billing Software

- **Roll Number / Project ID**: Roll No. 37 · Project P37 (`P37-BillBook`)
- **Course**: AI in Software Engineering (Integrated Project)
- **Technology Stack**: React + TypeScript + Tailwind CSS (Frontend), Java 17 + Spring Boot 3 (Backend), MySQL 8 (Database), Docker Compose, GitHub Actions, Jenkins, JUnit 5 + JaCoCo, Selenium 4, SonarQube

---

## 1. Executive Summary & Problem Statement
Small and medium Indian retail/wholesale businesses frequently suffer manual billing errors, wrong GST rate applications (`0%, 5%, 12%, 18%, 28%`), misclassified intra-state (`CGST+SGST`) vs inter-state (`IGST`) taxes, and overlooked excessive discounts or duplicate invoices. **BillBook** solves these problems for **Shop Owners** and **Accountants** by pairing strictly **deterministic financial calculation** (`BigDecimal` with `RoundingMode.HALF_UP`) with **advisory auto-categorisation** and **explainable anomaly detection**.

## 2. System Architecture & Mode Isolation
- **Preview Mode**: Uses synthetic demonstration data persisted in browser `localStorage` for zero-dependency evaluation.
- **Production Mode**: Communicates over REST (`/api/*`) with Java Spring Boot and MySQL 8. Never silently falls back to synthetic data if the backend is unavailable.
- **Database Schema (`database/schema.sql`)**: 6 relational tables (`customers`, `products`, `invoices`, `invoice_items`, `anomaly_alerts`, `audit_logs`).

## 3. Syllabus Modules Completed (37 Activities)
- **Module 1 (1.1–1.6)**: Hybrid Incremental-Prototyping-V process model, manual vs AI workflow comparison, Copilot/Tabnine/LLM scorecard, SRS v1->v2 audit, Mermaid Use Case/ER/5-screen diagrams, RTM.
- **Module 2 (2.1–2.8)**: 4 Agile values, 2 one-week Sprints, 25 INVEST user stories, Jira CSV import (`billbook_jira_import.csv`), Kanban WIP limits, XP TDD & Lean 7 wastes, Planning Poker calibration.
- **Module 3 (3.1–3.8)**: Development diary, 3-variant Prompt Engineering Library, Git PR & merge conflict guide, GitHub Actions CI, Jenkinsfile, Docker Compose + Nginx reverse proxy.
- **Module 4 (4.1–4.9)**: 15 manual cases, JUnit 5 + MockMvc H2 integration tests, JaCoCo >=80% gate, Selenium POM suite, 50-invoice GST & 20-case anomaly datasets, `defect_predictor.py`, Monitoring dashboard + Actuator.
- **Module 5 (5.1–5.6)**: 1-page SQA plan scoring 5 ISO 25010 attributes, `sonar-project.properties`, 3-way code review, manual vs AI GST edge comparison, Responsible AI financial integrity checklist.

## 4. Verification Summary
- **Verified in Workspace**: TypeScript compile (`tsc --noEmit`), Vite production build, 11/11 Node automated tests (`50/50` GST accuracy = `100%`, `10/10` anomaly dataset recall = `100%` with `0` false positives, strict `ApiError` rejection), and Playwright browser verification.
- **Pending Local Execution**: Local Windows/Linux execution of Maven JUnit + JaCoCo (`mvn verify`), MySQL 8 runtime, Selenium ChromeDriver, SonarQube Server scan, and GitHub Actions / Jenkins screenshots (`PROJECT_COMPLETION_STATUS.md`).
