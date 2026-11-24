# Module 4 — Activity 4.7: Software Defect Prediction & Complexity Analysis

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`defect_metrics.csv` & `defect_predictor.py` authored and executed)

## 1. Objective
Use static code metrics (**LOC**, **Cyclomatic Complexity**, **Coupling / Fan-Out**, **Churn Commits**, **Branch Coverage %**) across BillBook modules to rank defect proneness and guide targeted QA focus.

## 2. Artifacts Included
- `defect_metrics.csv`: Structured feature metrics for 10 BillBook backend & frontend modules.
- `defect_predictor.py`: Interpretable Python risk-scoring model computing defect probability and flagging high-risk modules (`HIGH`, `MEDIUM`, `LOW`) for prioritized test coverage.

## 3. Expected Evidence
- `defect_metrics.csv` + `defect_predictor.py` output ranking highest-risk modules (`InvoiceService.java`, `AnomalyDetectionService.java`, `InvoiceBuilderView.tsx`).
