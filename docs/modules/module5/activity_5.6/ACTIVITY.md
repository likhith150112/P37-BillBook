# Module 5 — Activity 5.6: Responsible AI, Financial Ethics & SQA Synthesis

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED`

## 1. Objective
Document BillBook's ethical guardrails, Responsible AI governance checklist, and final synthesis of AI benefits & challenges in Software Quality Assurance (`P37` specific principle: *"Financial accuracy is critical: never let AI change amounts without review"*).

## 2. BillBook Responsible AI & Financial Ethics Checklist

| Control | Governance Rule | Enforcement Location in BillBook | Status |
|---|---|---|---|
| **Human-in-the-Loop Totals** | Never allow probabilistic AI to alter unit prices, discounts, tax rates, or grand totals | `gstCalculator.ts`, `GstCalculationService.java` (`BigDecimal`) | Enforced |
| **Advisory Categorisation** | Category/HSN/GST suggestions must carry explanation & `advisoryOnly: true` | `categorizer.ts`, `AutoCategorisationService.java`, `ProductsView.tsx` | Enforced |
| **Explainable Anomaly Screening** | Flagged anomalies show `metricValue`, `baselineValue`, and plain-text cause; block save until human confirmation | `anomalyDetector.ts`, `AnomalyDetectionService.java`, `InvoiceBuilderView.tsx` | Enforced |
| **Auditability** | Every invoice issue, payment, and anomaly review logs actor, note, and timestamp | `AuditLogController.java`, `MonitoringView.tsx` | Enforced |
| **Synthetic Data & No Secret Leaks** | Zero real customer PII, GSTINs, or passwords committed to repo | `seedData.ts`, `seed.sql`, `.env.example`, `/AI_Disclosure.md` | Enforced |

## 3. Benefits & Challenges in SQA
- **Benefits**: Automated 50-case boundary coverage, faster defect-risk prioritization (`defect_predictor.py`), and repeatable `node:test` + MockMvc verification.
- **Challenges**: AI cannot self-certify SonarQube gates, JaCoCo metrics, or real MySQL execution without running tools locally; BillBook therefore maintains strict `COMPLETED` vs `PENDING` evidence honesty.

## 4. Expected Evidence
- Responsible AI checklist (`ACTIVITY.md`) + `/AI_Disclosure.md` + `/SYLLABUS_COVERAGE_CHECKLIST.md`.
