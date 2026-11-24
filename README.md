# BillBook — Invoice and GST Billing Software (Project P37)

**AI in Software Engineering Integrated Project — Roll No. 37**  
**Repository:** `P37-BillBook`

BillBook is a full-stack commercial GST billing and accounting application built for Indian SMEs with a **React 19 + TypeScript + Tailwind CSS** frontend, **Java 17 + Spring Boot 3** REST backend, and **MySQL 8** relational database.

---

## Preview Mode vs Production Mode (Strict Separation)

BillBook separates offline UI demonstration from live backend persistence with **zero silent fallback**:

| Mode | Data Source | Behavior |
|---|---|---|
| **Preview Mode** (Default in browser sandbox) | Synthetic demo records in `localStorage` | Works standalone without Java or MySQL. Clearly badged **Preview Mode** in the top bar and sidebar. |
| **Production Mode** | Live Spring Boot REST API (`/api/*`) + MySQL 8 | Connects exclusively to `VITE_API_BASE_URL` (default `http://localhost:8080` or `/api` behind Nginx). If Spring Boot is unreachable, displays an explicit **Production Backend Unavailable (No Silent Mock Fallback)** alert with Retry / Switch actions—never substituting mock data. |

---

## Key Features

1. **Executive Business Dashboard**: Revenue, GST collected (CGST+SGST vs IGST), pending receivables, monthly sales charts, and GST slab breakdown.
2. **Customer Management**: Full CRUD and search for B2B (15-character GSTIN) and B2C accounts with automatic state supply classification.
3. **Product & HSN Catalog**: SKUs, HSN/SAC codes, prices, stock tracking, GST slabs (`0%, 5%, 12%, 18%, 28%`), and advisory category suggestions.
4. **Multi-Product Invoice Builder**: Dynamic line items, quantities, item discounts, intra-state vs inter-state detection, and Indian GST round-off.
5. **Deterministic GST Calculation Engine**: Java `BigDecimal` (`RoundingMode.HALF_UP`) and TypeScript paise-safe arithmetic verified to **100% accuracy across 50 benchmark test invoices**.
6. **Advisory Auto-Categorisation**: Explainable keyword/HSN rules requiring explicit user confirmation before applying.
7. **Intelligent Anomaly Detection**: Flags excessive discounts (>25%), quantity spikes, HSN-rate mismatches, under-priced items, Z-score invoice outliers, and duplicate invoice risks with human review workflow.
8. **Invoice Ledger & Payment Tracking**: Searchable history supporting `PAID`, `PENDING`, `PARTIAL`, and `OVERDUE` states plus partial payments.
9. **Printable & PDF GST Invoices**: A4 GST Tax Invoice preview modal and downloadable `.pdf` export via `jsPDF`.
10. **Sales & GSTR-1 Reports**: HSN-wise summary (GSTR-1 Table 12), B2B/B2C split, customer revenue ranking, and CSV exports.
11. **Monitoring & QA Console**: Live 50-invoice GST verifier, labeled anomaly recall benchmark, backend health/metrics status, and calculation audit trail.
12. **Responsive Desktop & Mobile Layout**: Navy (`#0B1F3A`), white, and emerald-green commercial accounting workspace.

---

## Repository Structure

```text
├── src/                               # React + TypeScript + Tailwind CSS frontend
│   ├── components/                    # Modular views, Sidebar/TopBar mode switcher & PDF Tax Invoice modal
│   ├── data/                          # Synthetic SME demo dataset (Preview Mode only)
│   ├── services/                      # Typed Spring Boot REST client (src/services/api.ts + api.test.ts)
│   ├── types/                         # Domain models & AppMode ('preview' | 'production')
│   └── utils/                         # Deterministic GST, categorisation, anomaly, PDF & dataset tests
├── backend/                           # Java 17 Spring Boot 3 REST API
│   ├── src/main/java/com/billbook/    # config, controller, dto, model, repository, service
│   ├── src/test/java/com/billbook/    # JUnit 5 50-invoice GST tests & MockMvc integration tests
│   ├── Dockerfile
│   └── pom.xml                        # Includes JaCoCo >= 80% coverage gate
├── database/
│   ├── schema.sql                     # MySQL 8 DDL (customers, products, invoices, items, anomalies, audit_logs)
│   └── seed.sql                       # Idempotent synthetic demonstration seed data
├── tests/
│   ├── datasets/                      # 50 GST test invoices & 20 labeled anomaly invoices (JSON + CSV)
│   ├── selenium/                      # Selenium 4 + JUnit 5 Page Object Model browser suite
│   ├── manual/                        # 15 manual QA cases (MTC-01..MTC-15)
│   └── results/                       # Execution results log & local run template
├── docs/
│   ├── modules/module1..module5/      # All 37 syllabus activities (1.1–5.6) + diagrams, Jira CSV & Python predictor
│   ├── P37_BillBook_Project_Report.md # University Project Report (Appendix B)
│   └── P37_BillBook_PPT_Outline.md    # 12-Slide Presentation Outline (Appendix C)
├── scripts/windows/                   # PowerShell setup, DB, backend, frontend, test & Docker scripts
├── WINDOWS_SETUP.md                   # Beginner-friendly step-by-step Windows PowerShell guide
├── AI_Usage_Log.md                    # Chronological AI engineering & human correction log
├── AI_Disclosure.md                   # Academic integrity & financial safeguard disclosure
├── SYLLABUS_COVERAGE_CHECKLIST.md     # 37-activity status tracker (COMPLETED vs PENDING)
├── PROJECT_COMPLETION_STATUS.md       # Honest workspace vs local verification breakdown
├── sonar-project.properties           # SonarQube static analysis configuration
├── .github/workflows/ci.yml           # GitHub Actions CI workflow
├── Jenkinsfile                        # Declarative Jenkins CI/CD pipeline
├── docker-compose.yml                 # Full-stack MySQL 8 + Spring Boot + Nginx/React stack
├── nginx.conf                         # Reverse proxy forwarding /api/* & /actuator/* to backend
└── Dockerfile                         # React multi-stage production container
```

---

## Quick Start (Windows, Docker, or Local Dev)

- **Windows Beginners:** Follow **[`WINDOWS_SETUP.md`](WINDOWS_SETUP.md)** or run the PowerShell automation scripts inside [`scripts/windows/`](scripts/windows/).
- **Docker Compose (Full Stack):**
  ```bash
  cp .env.example .env
  docker compose up --build
  ```
  - React UI (Nginx): `http://localhost:3000`
  - Spring Boot API: `http://localhost:8080/api` (Health: `http://localhost:8080/actuator/health`)
  - MySQL 8: `localhost:3306` (`billbook_db`)

---

## Automated Verification Commands

```bash
# 1. Frontend TypeScript check, unit/dataset/API suites (11 tests) & production build
npm run lint
npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts
npm run build

# 2. Python defect risk predictor (Activity 4.7)
python3 docs/modules/module4/activity_4.7/defect_predictor.py

# 3. Backend JUnit 5 + MockMvc + JaCoCo >=80% gate (requires JDK 17 + Maven locally)
cd backend && mvn verify

# 4. Selenium 4 browser suite (requires Chrome + running app on port 3000)
cd tests/selenium && mvn test
```

See [`PROJECT_COMPLETION_STATUS.md`](PROJECT_COMPLETION_STATUS.md) and [`tests/results/EXECUTION_RESULTS_TEMPLATE.md`](tests/results/EXECUTION_RESULTS_TEMPLATE.md) for verified workspace results vs pending local runs.
