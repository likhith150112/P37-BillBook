/**
 * Module 5 — Activity 5.5:
 * Side-by-side comparison of naive AI-generated GST helper vs BillBook audited deterministic implementation,
 * plus PII/GSTIN sensitive data masking utility before external AI inspection.
 */

export function naiveAiGstTax(taxable: number, gstRate: number): number {
  // Typical unreviewed AI snippet: uses raw binary float without slab validation or EPSILON paise rounding
  return (taxable * gstRate) / 100;
}

const ALLOWED_SLABS = new Set([0, 5, 12, 18, 28]);

export function auditedDeterministicGstTax(taxable: number, gstRate: number): number {
  if (!ALLOWED_SLABS.has(gstRate)) {
    throw new Error(`Invalid Indian GST slab: ${gstRate}%. Allowed: 0, 5, 12, 18, 28.`);
  }
  if (!Number.isFinite(taxable) || taxable < 0) {
    throw new Error('Taxable value must be a non-negative finite number.');
  }
  return Math.round(((taxable * gstRate) / 100 + Number.EPSILON) * 100) / 100;
}

export function maskSensitiveBillingText(input: string): string {
  return input
    // Mask 15-char Indian GSTIN leaving state code + last 2 chars
    .replace(/\b(\d{2})[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z([A-Z\d]{1})\b/g, '$1***********Z$2')
    // Mask phone numbers
    .replace(/(\+91[\s-]?)?\b\d{5}[\s-]?\d{5}\b/g, '+91 XXXXX-XXXXX')
    // Mask email local parts
    .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@$2');
}
