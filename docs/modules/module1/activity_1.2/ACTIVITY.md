# Module 1 — Activity 1.2: Manual vs AI-Assisted Development

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (Empirical comparison documented across BillBook codebase)

## 1. Objective
Compare manual software engineering workflows against AI-assisted development across requirements drafting, architecture scaffolding, GST engine implementation, UI creation, and verification.

## 2. Procedure
1. Contrast manual creation vs AI-assisted generation across SDLC phases for BillBook.
2. Track speed gains alongside failure modes caught during human engineering review.
3. Establish BillBook's strict governance boundary (AI accelerates boilerplate; humans verify every financial invariant).

## 3. Implementation & Observed Findings in BillBook

| SDLC Activity | Manual Approach | AI-Assisted Approach | Net Outcome & Risk Control |
|---|---|---|---|
| Entity & DDL Modeling | Hand-write `schema.sql` & 5 JPA entities (~4 hrs) | Generated draft schema + JPA entities (~20 mins) | Human caught `LazyInitializationException` under `open-in-view=false` and added `FetchMode.SUBSELECT` + `cgst_rate`/`sgst_rate`/`igst_rate`. |
| GST Tax Calculation | Hand-derive `BigDecimal` rounding rules (~2 hrs) | Drafted initial service (~10 mins) | Human added explicit slab validation (`0,5,12,18,28`) and verified all 50 benchmark cases independently. |
| React Tax Invoice UI | Build 8 Tailwind screens & jsPDF layout (~10 hrs) | Rapid component generation (~1.5 hrs) | Human verified Preview vs Production separation so Production Mode never falls back silently to mock data. |
| SRS & Test Generation | Write 25 user stories & 50 test rows (~5 hrs) | Generated structured drafts (~25 mins) | Human removed AI hallucinated claims (e.g., live GSTN e-Way bill portal filing) not in scope. |

## 4. Expected Evidence
- Phase-by-phase comparison matrix and concrete defect catches (`Invoice.java` lazy-fetch fix, `api.ts` strict mode boundary).
- Cross-referenced in `/AI_Usage_Log.md`.
