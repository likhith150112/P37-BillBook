# Module 5 — Activity 5.5: Manual vs AI-Generated Code Comparison & Sensitive Data Masking

- **Project**: P37 — BillBook: Invoice and GST Billing Software (Roll No. 37)
- **Completion Status**: `COMPLETED` (`manual_vs_ai_gst_comparison.ts` & comparison report authored)

## 1. Objective
Compare a **hand-written deterministic reference GST calculation function** against **AI-generated calculation code** on edge cases (`0.49` / `0.50` round-off, negative inputs, invalid GST slabs, float precision drift) and apply sensitive data masking rules before sending any billing context to AI prompts.

## 2. Included Artifact
- `manual_vs_ai_gst_comparison.ts` — Executable side-by-side comparison + GSTIN/email masking helper.

## 3. Key Findings Summary
- **Floating-Point Drift**: Naive AI JS code `(gross * rate / 100)` without `round2` (`Number.EPSILON`) produces `10720.800000000001`, failing exact rupee comparisons unless rounded per line.
- **Invalid Tax Slab**: Naive AI code accepted `gstRate = 15` silently; BillBook's audited Java service rejects any slab outside `{0, 5, 12, 18, 28}`.
- **Data Masking Policy**: Before sharing any sample logs/invoices with external AI tools, 15-character GSTINs, phone numbers, and bank accounts are masked (e.g., `29*****1K1Z5`) and only synthetic `*.example` addresses are used.

## 4. Expected Evidence
- `manual_vs_ai_gst_comparison.ts` inside this folder.
