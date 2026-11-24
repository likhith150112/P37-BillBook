# Module 1 — Activity 1.4: SRS & Requirements Engineering

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` for SRS v1 (AI draft), SRS v2 (human-corrected), ER/Use-Case/UI diagrams, and interview guide | `PENDING` for signed live role-play interview notes

## 1. Objective
Conduct requirements elicitation with target personas (**Shop Owners** and **Accountants**), draft an initial Software Requirements Specification (`SRS v1`) using AI, audit and correct hallucinations/missing tax rules into `SRS v2`, and produce Use Case, ER/Class, and 5-screen prototype diagrams.

## 2. Procedure
1. Run structured role-play interviews with Shop Owner & Accountant personas (template below).
2. Capture AI-drafted `SRS_v1_AI_Draft.md` and log every ambiguity or hallucinated claim.
3. Produce corrected IEEE 830–style `SRS_v2_Human_Corrected.md` + Mermaid diagrams in `diagrams.md`.

## 3. Stakeholder Interview Role-Play Protocol (Status: `PENDING` human transcript signature)
- **Persona A — Retail & B2B Shop Owner (Bengaluru)**: Focuses on fast 60-second counter checkout, item HSN lookup, discounts, and printable A4 PDF bills.
- **Persona B — Chartered Accountant / Bookkeeper**: Focuses on exact CGST+SGST vs IGST split by customer state, HSN-wise GSTR-1 Table 12 summary, rounding to nearest rupee, and catching accidental 40% discounts or wrong GST slabs before filing.

## 4. Artifacts Included in This Folder
- `SRS_v1_AI_Draft.md` — Initial unedited AI-generated specification containing typical gaps.
- `SRS_v2_Human_Corrected.md` — Manually corrected production SRS with non-negotiable financial invariants.
- `diagrams.md` — Mermaid **Use Case Diagram**, **Entity-Relationship (ER) Diagram**, and **5-Screen UI Flow** mapped to the actual BillBook screens (`Dashboard`, `Customers`, `Products & HSN`, `Create Invoice`, `Reports & Print`).

## 5. Expected Evidence
- Both SRS versions + diff commentary + rendered diagrams + signed stakeholder interview sheet (**PENDING** class role-play completion).
