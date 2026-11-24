# BillBook SRS v1 (Unedited AI Draft — Retained for Module 1.4 Comparison)

> **Audit Note**: This draft represents an initial AI-generated specification before human engineering review. **Known defects corrected in `SRS_v2_Human_Corrected.md`**: (1) Hallucinated live GSTN e-Way Bill government portal integration, (2) Omitted deterministic `BigDecimal` rounding rule, (3) Allowed AI to auto-overwrite GST rates without human confirmation, (4) Missing Preview vs Production backend separation.

## 1. Purpose
BillBook is a web billing platform for Indian SMEs built using React, Spring Boot, and MySQL.

## 2. Core Features
1. Dashboard showing sales metrics.
2. Customer management (add, edit, delete).
3. Product management with automatic AI GST & category assignment on save.
4. Invoice builder with AI-optimized discount and tax calculation.
5. Direct live upload of invoices to the Government GSTN Portal and e-Way bill API.
6. Payment tracking and PDF export.

## 3. Non-Functional Requirements
- The app should be fast and responsive.
- Data is stored in MySQL or local browser storage interchangeably.
