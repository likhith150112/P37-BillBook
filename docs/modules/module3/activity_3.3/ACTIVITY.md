# Module 3 — Activity 3.3: Git Branching, Pull Requests & Merge Conflict Resolution

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Branch strategy, PR template, and merge-conflict lab guide created) | `PENDING` (Live GitHub PR merge screenshot after pushing repository)

## 1. Objective
Establish clean Gitflow-lite branching (`main`, `feature/*`, `fix/*`, `docs/*`), standardized Pull Request reviews (`PR_TEMPLATE.md`), and a reproducible planned merge-conflict resolution workflow (`MERGE_CONFLICT_GUIDE.md`).

## 2. Branching Strategy (`P37-BillBook`)
- `main`: Always deployable; protected by GitHub Actions CI (`npm run lint`, `tsx --test`, `npm run build`, `mvn verify`).
- `feature/BB-07-gst-engine`: Deterministic `BigDecimal` CGST/SGST/IGST & round-off service.
- `feature/BB-13-categoriser-anomaly`: Advisory HSN matcher + 6-rule anomaly detector.
- `feature/BB-23-prod-api-integration`: Strict Production Mode REST integration (`src/services/api.ts`).

## 3. Artifacts Included
- `PR_TEMPLATE.md` — Pull Request checklist verifying zero mock fallback and deterministic math.
- `MERGE_CONFLICT_GUIDE.md` — Planned conflict exercise modifying `CorsConfig` / `gstCalculator` across two feature branches.

## 4. Expected Evidence
- GitHub PR + resolved conflict commit URL after pushing to GitHub (**PENDING** remote push).
