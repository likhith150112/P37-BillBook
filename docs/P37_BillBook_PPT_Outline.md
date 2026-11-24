# Project Presentation Outline (12 Slides) — P37 BillBook

1. **Slide 1 — Title**: Project P37: BillBook — Invoice and GST Billing Software (Roll No. 37, Stack: React + Spring Boot + MySQL).
2. **Slide 2 — Problem & Personas**: Counter checkout speed & GST accuracy pain points for Shop Owners and Accountants.
3. **Slide 3 — Process Model & SRS Audit**: Why Hybrid Incremental + Prototyping + V-Model fits GST billing; SRS v1 hallucinations removed in SRS v2.
4. **Slide 4 — Agile Execution**: 2 One-Week Sprints, 25 User Stories, Jira CSV, Kanban WIP Limits (`2/2`), XP TDD.
5. **Slide 5 — Full-Stack Architecture**: React (`src/services/api.ts`), Spring Boot 3 (`BigDecimal`), MySQL 8 ER Diagram, Preview vs Production isolation.
6. **Slide 6 — Deterministic GST Engine**: Intra-state (`CGST + SGST`) vs Inter-state (`IGST`), nearest-rupee round-off, INR words.
7. **Slide 7 — Advisory Auto-Categorisation**: HSN/SAC rule matcher returning confidence & `advisoryOnly: true`.
8. **Slide 8 — Explainable Anomaly Detection**: 6 rules (`Z-score`, `Discount >25%`, `HSN-GST Mismatch`, `Qty >=40`, `Price Drop`, `Duplicate 3d`) + accountant review gate.
9. **Slide 9 — DevOps & CI/CD**: Prompt library (Variant 3 scored 4.8/5), GitHub Actions, Jenkinsfile, Docker Compose + Nginx.
10. **Slide 10 — Testing & Verification**: 50 GST invoices (`100%` accuracy), 20 labeled anomaly cases (`>=70%` recall target), JUnit + JaCoCo (`>=80%`), Selenium POM.
11. **Slide 11 — SQA & Responsible AI**: 5 quality attributes, SonarQube setup, *"Never let AI change financial amounts without human review"*.
12. **Slide 12 — Live Demo & Conclusion**: Demo Preview Mode, Production Mode explicit error handling, PDF export, GSTR-1 CSV.
