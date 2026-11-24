# Module 4 — Activity 4.2: JUnit 5 Unit Tests & JaCoCo Coverage

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (JUnit 5 suites & JaCoCo >=80% plugin configured) | `PENDING` (Local `mvn verify` JaCoCo HTML report)

## 1. Objective
Verify core BillBook Java services (`GstCalculationService`, `AutoCategorisationService`, `AnomalyDetectionService`) using JUnit 5 unit tests and enforce an `>= 80%` JaCoCo instruction coverage threshold.

## 2. Implementation Details
- `backend/src/test/java/com/billbook/GstCalculationServiceTest.java`:
  - Intra-state 50/50 CGST + SGST verification.
  - Inter-state 28% IGST verification.
  - **Official rounding check**: verifies `89.73 * 12%` splits into `5.38 + 5.38` (`100.49`) and rounds off cleanly by `-0.49` to `100.00` (`RoundingMode.HALF_UP`).
  - Unsupported GST slab (`15%`) throws `IllegalArgumentException`.
  - Runs all 50 intra/inter-state invoice cases across slabs `{0, 5, 12, 18, 28}`.
- `backend/src/test/java/com/billbook/AnomalyAndCategorisationTest.java`:
  - Tests keyword HSN/GST categorisation and `advisoryOnly = true`.
  - Verifies excessive discount & HSN-GST mismatch flagging.
- `backend/pom.xml`: Configures `jacoco-maven-plugin` `0.8.12` with `prepare-agent`, `report`, and `check` (`minimum = 0.80`).

## 3. Expected Evidence
- `GstCalculationServiceTest.java`, `AnomalyAndCategorisationTest.java`, `backend/pom.xml`.
- Local `backend/target/site/jacoco/index.html` screenshot after running `mvn verify` (**PENDING** local JDK/Maven run).
