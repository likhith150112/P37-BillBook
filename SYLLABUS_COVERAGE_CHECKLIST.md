# Syllabus Coverage Checklist — Project P37 (BillBook)

**Assigned Project:** P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)  
**Status Legend:**  
- `COMPLETED` — Documentation, implementation, scripts, and/or Node/Python workspace checks completed and verified on disk.  
- `PENDING` — Artifact and instructions are complete, but final live run/evidence screenshot requires local Windows environment (JDK 17 + Maven, MySQL 8, Chrome/Selenium, SonarQube, Jenkins) or manual human walkthrough.

---

## Module 1 — Software Process Models, AI Tools & Requirements Engineering

| Activity | Title | Folder & Deliverables | Status | Notes |
|---|---|---|---|---|
| **1.1** | Software Process Model Comparison | [`docs/modules/module1/activity_1.1/ACTIVITY.md`](docs/modules/module1/activity_1.1/ACTIVITY.md) | **COMPLETED** | Waterfall vs Spiral vs Iterative vs Agile-Scrum matrix for GST billing. |
| **1.2** | Manual vs AI-Assisted Development | [`docs/modules/module1/activity_1.2/ACTIVITY.md`](docs/modules/module1/activity_1.2/ACTIVITY.md) | **COMPLETED** | Time/defect/rework comparison across BillBook modules. |
| **1.3** | AI Coding Tool Comparison | [`docs/modules/module1/activity_1.3/ACTIVITY.md`](docs/modules/module1/activity_1.3/ACTIVITY.md) | **COMPLETED** | Comparative rubric across AI coding assistants and local safeguards. |
| **1.4** | SRS & Requirements Engineering | [`docs/modules/module1/activity_1.4/ACTIVITY.md`](docs/modules/module1/activity_1.4/ACTIVITY.md), [`SRS_v1_AI_Draft.md`](docs/modules/module1/activity_1.4/SRS_v1_AI_Draft.md), [`SRS_v2_Human_Corrected.md`](docs/modules/module1/activity_1.4/SRS_v2_Human_Corrected.md), [`diagrams.md`](docs/modules/module1/activity_1.4/diagrams.md) | **COMPLETED** | IEEE 830 v1 AI draft -> v2 human-corrected SRS + Use Case, Sequence, ER, and Architecture Mermaid diagrams. |
| **1.5** | AI-Assisted Code Generation | [`docs/modules/module1/activity_1.5/ACTIVITY.md`](docs/modules/module1/activity_1.5/ACTIVITY.md) | **COMPLETED** | Documents prompt-to-code generation of `GstCalculationService.java` & `billing.ts` with BigDecimal audit. |
| **1.6** | Requirements-Based Testing | [`docs/modules/module1/activity_1.6/ACTIVITY.md`](docs/modules/module1/activity_1.6/ACTIVITY.md) | **COMPLETED** | Bidirectional Requirements Traceability Matrix (`FR-01..FR-12`) mapped to tests. |

---

## Module 2 — Agile, Scrum, Kanban, XP & AI-Assisted Planning

| Activity | Title | Folder & Deliverables | Status | Notes |
|---|---|---|---|---|
| **2.1** | Agile Values & Principles | [`docs/modules/module2/activity_2.1/ACTIVITY.md`](docs/modules/module2/activity_2.1/ACTIVITY.md) | **COMPLETED** | 4 Agile values and 12 principles mapped to BillBook delivery practices. |
| **2.2** | Scrum & Sprint Planning | [`docs/modules/module2/activity_2.2/ACTIVITY.md`](docs/modules/module2/activity_2.2/ACTIVITY.md) | **COMPLETED** | 3 two-week sprint plans, DoR, DoD, and retrospective notes. |
| **2.3** | Product Backlog & User Stories | [`docs/modules/module2/activity_2.3/ACTIVITY.md`](docs/modules/module2/activity_2.3/ACTIVITY.md), [`PRODUCT_BACKLOG_25_STORIES.md`](docs/modules/module2/activity_2.3/PRODUCT_BACKLOG_25_STORIES.md) | **COMPLETED** | 25 INVEST-compliant user stories with Gherkin acceptance criteria & story points. |
| **2.4** | Kanban Board & WIP Limits | [`docs/modules/module2/activity_2.4/ACTIVITY.md`](docs/modules/module2/activity_2.4/ACTIVITY.md) | **COMPLETED** | Column definitions, WIP limits, bottleneck policies, and CFD metrics. |
| **2.5** | XP & Lean Practices | [`docs/modules/module2/activity_2.5/ACTIVITY.md`](docs/modules/module2/activity_2.5/ACTIVITY.md) | **COMPLETED** | TDD, pair programming (human + AI), CI, refactoring, and waste elimination. |
| **2.6** | AI-Assisted Estimation | [`docs/modules/module2/activity_2.6/ACTIVITY.md`](docs/modules/module2/activity_2.6/ACTIVITY.md) | **COMPLETED** | Planning Poker + T-shirt sizing vs AI calibration across complex tax rules. |
| **2.7** | Jira CSV Import & Planning Docs | [`docs/modules/module2/activity_2.7/ACTIVITY.md`](docs/modules/module2/activity_2.7/ACTIVITY.md), [`billbook_jira_import.csv`](docs/modules/module2/activity_2.7/billbook_jira_import.csv) | **COMPLETED** | 25-row Jira-importable CSV validated for headers, story points, and epics. |
| **2.8** | Benefits & Challenges of AI-Assisted Agile | [`docs/modules/module2/activity_2.8/ACTIVITY.md`](docs/modules/module2/activity_2.8/ACTIVITY.md) | **COMPLETED** | Critical analysis of velocity gains vs scope drift and hallucinated estimates. |

---

## Module 3 — AI-Assisted Development, Git, CI/CD, Docker & Deployment

| Activity | Title | Folder & Deliverables | Status | Notes |
|---|---|---|---|---|
| **3.1** | AI-Assisted Development Diary | [`docs/modules/module3/activity_3.1/ACTIVITY.md`](docs/modules/module3/activity_3.1/ACTIVITY.md) | **COMPLETED** | Session-by-session engineering diary synced with `AI_Usage_Log.md`. |
| **3.2** | Prompt Engineering | [`docs/modules/module3/activity_3.2/ACTIVITY.md`](docs/modules/module3/activity_3.2/ACTIVITY.md), [`PROMPT_ENGINEERING_LIBRARY.md`](docs/modules/module3/activity_3.2/PROMPT_ENGINEERING_LIBRARY.md) | **COMPLETED** | Zero-shot, role/constraint, and schema-grounded prompt variants with rubrics. |
| **3.3** | Git Branches & Pull Requests | [`docs/modules/module3/activity_3.3/ACTIVITY.md`](docs/modules/module3/activity_3.3/ACTIVITY.md), [`PR_TEMPLATE.md`](docs/modules/module3/activity_3.3/PR_TEMPLATE.md), [`MERGE_CONFLICT_GUIDE.md`](docs/modules/module3/activity_3.3/MERGE_CONFLICT_GUIDE.md) | **COMPLETED** | GitFlow branching strategy, PR checklist, and conflict resolution playbook. |
| **3.4** | GitHub Actions CI/CD | [`docs/modules/module3/activity_3.4/ACTIVITY.md`](docs/modules/module3/activity_3.4/ACTIVITY.md), [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | **PENDING** (Cloud CI Run) | Workflow authored and updated; awaits push to GitHub Actions runner for live green badge. |
| **3.5** | Jenkins Pipeline | [`docs/modules/module3/activity_3.5/ACTIVITY.md`](docs/modules/module3/activity_3.5/ACTIVITY.md), [`Jenkinsfile`](Jenkinsfile) | **PENDING** (Local Jenkins Run) | Declarative `Jenkinsfile` authored; requires local Jenkins controller execution. |
| **3.6** | Docker & Docker Compose | [`docs/modules/module3/activity_3.6/ACTIVITY.md`](docs/modules/module3/activity_3.6/ACTIVITY.md), [`Dockerfile`](Dockerfile), [`backend/Dockerfile`](backend/Dockerfile), [`docker-compose.yml`](docker-compose.yml), [`nginx.conf`](nginx.conf) | **PENDING** (Docker Engine Run) | Multi-stage builds, Nginx proxy, and Compose config authored; requires local Docker Desktop verification. |
| **3.7** | Deployment Documentation | [`docs/modules/module3/activity_3.7/ACTIVITY.md`](docs/modules/module3/activity_3.7/ACTIVITY.md), [`WINDOWS_SETUP.md`](WINDOWS_SETUP.md), [`scripts/windows/`](scripts/windows/) | **COMPLETED** | Complete Windows PowerShell + Linux/Docker deployment instructions and automation scripts. |
| **3.8** | Development Benefits & Challenges | [`docs/modules/module3/activity_3.8/ACTIVITY.md`](docs/modules/module3/activity_3.8/ACTIVITY.md) | **COMPLETED** | Analysis of Spring Boot/React alignment issues caught (e.g., JPA lazy-fetch bug). |

---

## Module 4 — Verification, Testing, Defect Prediction & Monitoring

| Activity | Title | Folder & Deliverables | Status | Notes |
|---|---|---|---|---|
| **4.1** | Manual & Automated Testing Strategy | [`docs/modules/module4/activity_4.1/ACTIVITY.md`](docs/modules/module4/activity_4.1/ACTIVITY.md), [`tests/manual/MANUAL_TEST_CASES.md`](tests/manual/MANUAL_TEST_CASES.md) | **PENDING** (Human Sign-Off) | 15 manual cases (`MTC-01..MTC-15`) defined; human sign-off on local stack pending. |
| **4.2** | JUnit Unit Tests & JaCoCo | [`docs/modules/module4/activity_4.2/ACTIVITY.md`](docs/modules/module4/activity_4.2/ACTIVITY.md), [`GstCalculationServiceTest.java`](backend/src/test/java/com/billbook/GstCalculationServiceTest.java) | **PENDING** (Maven Execution) | Java 50-case tests + JaCoCo >=80% gate authored; TS equivalent verified 11/11 in Node (`tsx --test`). |
| **4.3** | Integration Testing (Spring Boot + MockMvc) | [`docs/modules/module4/activity_4.3/ACTIVITY.md`](docs/modules/module4/activity_4.3/ACTIVITY.md), [`BillBookIntegrationTest.java`](backend/src/test/java/com/billbook/BillBookIntegrationTest.java) | **PENDING** (Maven Execution) | End-to-end CRUD + MySQL-mode H2 integration suite authored; awaits local `mvn test`. |
| **4.4** | Selenium Browser Testing | [`docs/modules/module4/activity_4.4/ACTIVITY.md`](docs/modules/module4/activity_4.4/ACTIVITY.md), [`tests/selenium/`](tests/selenium/) | **PENDING** (Selenium Execution) | Selenium 4 Page Object Model suite authored; headless Playwright smoke check passed in workspace. |
| **4.5** | AI-Generated Test Cases & Datasets | [`docs/modules/module4/activity_4.5/ACTIVITY.md`](docs/modules/module4/activity_4.5/ACTIVITY.md), [`tests/datasets/`](tests/datasets/), [`src/utils/datasets.test.ts`](src/utils/datasets.test.ts) | **COMPLETED** | 50 GST invoices (100% pass) + 20 labeled anomaly invoices (100% recall, 0 FP) verified via Node test runner. |
| **4.6** | Risk-Based Test Prioritisation | [`docs/modules/module4/activity_4.6/ACTIVITY.md`](docs/modules/module4/activity_4.6/ACTIVITY.md) | **COMPLETED** | Likelihood x Impact financial risk matrix prioritizing GST math and tax mode boundaries. |
| **4.7** | Defect Prediction | [`docs/modules/module4/activity_4.7/ACTIVITY.md`](docs/modules/module4/activity_4.7/ACTIVITY.md), [`defect_metrics.csv`](docs/modules/module4/activity_4.7/defect_metrics.csv), [`defect_predictor.py`](docs/modules/module4/activity_4.7/defect_predictor.py) | **COMPLETED** | Python script executed cleanly; ranked `InvoiceBuilderView.tsx` (93.80 HIGH) top risk. |
| **4.8** | Application & Quality Monitoring | [`docs/modules/module4/activity_4.8/ACTIVITY.md`](docs/modules/module4/activity_4.8/ACTIVITY.md), [`MonitoringView.tsx`](src/components/MonitoringView.tsx) | **COMPLETED** | Live in-app QA verifier, Spring Boot Actuator health/metrics, and MySQL `audit_logs` table. |
| **4.9** | Testing Benefits & Challenges | [`docs/modules/module4/activity_4.9/ACTIVITY.md`](docs/modules/module4/activity_4.9/ACTIVITY.md) | **COMPLETED** | Evaluation of AI false-positive test assumptions (`ANOM-19` fixture bug case study). |

---

## Module 5 — Software Quality Assurance, SonarQube, Code Review & Ethics

| Activity | Title | Folder & Deliverables | Status | Notes |
|---|---|---|---|---|
| **5.1** | Software Quality Assurance (SQA) Plan | [`docs/modules/module5/activity_5.1/ACTIVITY.md`](docs/modules/module5/activity_5.1/ACTIVITY.md) | **COMPLETED** | IEEE 730 SQA plan, quality gates, and release governance. |
| **5.2** | Quality Attribute Measurements | [`docs/modules/module5/activity_5.2/ACTIVITY.md`](docs/modules/module5/activity_5.2/ACTIVITY.md) | **COMPLETED** | ISO/IEC 25010 metrics for Functional Correctness, Reliability, Security, and Maintainability. |
| **5.3** | SonarQube Configuration & Analysis | [`docs/modules/module5/activity_5.3/ACTIVITY.md`](docs/modules/module5/activity_5.3/ACTIVITY.md), [`sonar-project.properties`](sonar-project.properties) | **PENDING** (SonarQube Scan) | `sonar-project.properties` configured; local SonarQube scanner run + screenshot pending. |
| **5.4** | AI-Assisted Code Review | [`docs/modules/module5/activity_5.4/ACTIVITY.md`](docs/modules/module5/activity_5.4/ACTIVITY.md) | **COMPLETED** | Documented 5 concrete architectural defects caught during code review and fixed in source. |
| **5.5** | Manual vs AI-Generated Code Comparison | [`docs/modules/module5/activity_5.5/ACTIVITY.md`](docs/modules/module5/activity_5.5/ACTIVITY.md), [`manual_vs_ai_gst_comparison.ts`](docs/modules/module5/activity_5.5/manual_vs_ai_gst_comparison.ts) | **COMPLETED** | Side-by-side Halstead/cyclomatic & edge-case rounding comparison (`100.49` boundary). |
| **5.6** | Responsible AI & Ethics | [`docs/modules/module5/activity_5.6/ACTIVITY.md`](docs/modules/module5/activity_5.6/ACTIVITY.md), [`AI_Disclosure.md`](AI_Disclosure.md) | **COMPLETED** | Financial determinism, human-in-the-loop advisory policy, synthetic data, and transparency. |

---

## Capstone Submission Documents (Appendix B & C)
- **Project Report:** [`docs/P37_BillBook_Project_Report.md`](docs/P37_BillBook_Project_Report.md) — **COMPLETED** (update Section 7 evidence table after local Java/Selenium/SonarQube execution).
- **Presentation Outline (12 Slides):** [`docs/P37_BillBook_PPT_Outline.md`](docs/P37_BillBook_PPT_Outline.md) — **COMPLETED**.
