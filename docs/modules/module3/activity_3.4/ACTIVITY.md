# Module 3 — Activity 3.4: GitHub Actions CI/CD Pipeline

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`.github/workflows/ci.yml` configured) | `PENDING` (Live green GitHub Actions run URL after push)

## 1. Objective
Automate continuous build, lint, unit testing, dataset verification, and backend JaCoCo coverage checks on every `push` and `pull_request` to `main`.

## 2. Pipeline Implementation (`/.github/workflows/ci.yml`)
- **Job 1 (`frontend-verify`)**:
  - `npm ci`
  - `npm run lint` (`tsc --noEmit`)
  - `npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts`
  - `npm run build` (`vite build`)
- **Job 2 (`backend-verify`)**:
  - Sets up Eclipse Temurin JDK 17 + Maven cache
  - Executes `mvn verify -B` (runs `GstCalculationServiceTest`, `AnomalyAndCategorisationTest`, `BillBookIntegrationTest`, and JaCoCo >=80% gate)
  - Uploads `backend/target/site/jacoco/` coverage artifact

## 3. Expected Evidence
- Workflow YAML in `/.github/workflows/ci.yml`.
- GitHub Actions green badge / run screenshot after pushing to GitHub (**PENDING** push).
