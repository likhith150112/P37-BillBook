# Module 2 — Activity 2.5: Extreme Programming (XP) & Lean Practices

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (TDD cycles on GST core & Lean 7-wastes audit documented)

## 1. Objective
Apply **Extreme Programming (XP)** engineering practices (Test-Driven Development, Refactoring, Simple Design, Pair Programming) and **Lean Software Development** (7 Wastes elimination) to **BillBook**.

## 2. XP Practices Applied to Invoice Creation & GST Calculation
1. **Test-Driven Development (TDD Red-Green-Refactor)**:
   - **Red**: Authored `GstCalculationServiceTest` and `billing.test.ts` failing assertions for intra-state 50/50 split, inter-state IGST, and fractional paise round-off (`100.49 -> 100.00`).
   - **Green**: Implemented deterministic `BigDecimal` (`RoundingMode.HALF_UP`) and paise-safe `round2` math.
   - **Refactor**: Extracted `buildCandidateInvoice` in `InvoiceService.java` and shared HSN rules without changing any external tax totals.
2. **Pair Programming / AI-Human Pairing**: Developer drove domain invariants while AI suggested structural boilerplate and edge-case inputs (`0%`, `5%`, `28%`, `38% discount`).

## 3. Lean 7 Wastes Audit in BillBook

| Lean Waste | Example Eliminated in BillBook | Concrete Mitigation |
|---|---|---|
| **Partially Done Work** | Half-wired backend endpoints without frontend callers | Completed full React + Spring Boot contract in `src/services/api.ts` |
| **Extra Features (Overproduction)** | Hallucinated GSTN portal auto-filing from SRS v1 | Removed out-of-scope features; shipped clean GSTR-1 CSV export |
| **Relearning / Handoff** | Duplicate math formulas scattered across components | Centralized all tax logic in `gstCalculator.ts` and `GstCalculationService.java` |
| **Waiting** | Manual setup friction on Windows | Automated with `scripts/windows/*.ps1` and `docker-compose.yml` |
| **Defects** | Silent mock data masking failed backend API calls | Eliminated silent fallback; surfaced explicit `ApiError` banner |

## 4. Expected Evidence
- TDD test files (`src/utils/billing.test.ts`, `backend/src/test/java/com/billbook/GstCalculationServiceTest.java`) and Lean waste analysis (`ACTIVITY.md`).
