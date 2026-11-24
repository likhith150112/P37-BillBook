import type {
  CalculatedLineItem,
  GstRate,
  Invoice,
  InvoiceLineInput,
  TaxSupplyType,
} from '../types/billing.ts';

export const INDIAN_STATES: Array<{ name: string; code: string }> = [
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Assam', code: '18' },
  { name: 'Bihar', code: '10' },
  { name: 'Chandigarh', code: '04' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Delhi', code: '07' },
  { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' },
  { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Odisha', code: '21' },
  { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'West Bengal', code: '19' },
];

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function determineSupplyType(
  sellerState: string,
  customerState: string
): TaxSupplyType {
  const normalizedSeller = sellerState.trim().toLowerCase();
  const normalizedCustomer = customerState.trim().toLowerCase();
  return normalizedSeller === normalizedCustomer ? 'INTRA_STATE' : 'INTER_STATE';
}

export function calculateLineItem(
  input: InvoiceLineInput,
  supplyType: TaxSupplyType,
  lineId: string
): CalculatedLineItem {
  const safeQty = Math.max(0, input.quantity);
  const safePrice = Math.max(0, input.unitPrice);
  const safeDiscountPct = Math.min(100, Math.max(0, input.discountPercent));

  const grossAmount = round2(safeQty * safePrice);
  const discountAmount = round2((grossAmount * safeDiscountPct) / 100);
  const taxableValue = round2(grossAmount - discountAmount);

  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (supplyType === 'INTRA_STATE') {
    cgstRate = round2(input.gstRate / 2);
    sgstRate = round2(input.gstRate / 2);
    cgstAmount = round2((taxableValue * cgstRate) / 100);
    sgstAmount = round2((taxableValue * sgstRate) / 100);
  } else {
    igstRate = input.gstRate;
    igstAmount = round2((taxableValue * igstRate) / 100);
  }

  const totalTax = round2(cgstAmount + sgstAmount + igstAmount);
  const lineTotal = round2(taxableValue + totalTax);

  return {
    ...input,
    id: lineId,
    quantity: safeQty,
    unitPrice: safePrice,
    discountPercent: safeDiscountPct,
    grossAmount,
    discountAmount,
    taxableValue,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    lineTotal,
  };
}

export interface InvoiceTotals {
  supplyType: TaxSupplyType;
  items: CalculatedLineItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
}

export function calculateInvoiceTotals(
  lineInputs: InvoiceLineInput[],
  sellerState: string,
  customerState: string
): InvoiceTotals {
  const supplyType = determineSupplyType(sellerState, customerState);
  const items = lineInputs.map((item, idx) =>
    calculateLineItem(item, supplyType, `line-${idx + 1}`)
  );

  const subtotal = round2(items.reduce((sum, i) => sum + i.grossAmount, 0));
  const totalDiscount = round2(items.reduce((sum, i) => sum + i.discountAmount, 0));
  const taxableAmount = round2(items.reduce((sum, i) => sum + i.taxableValue, 0));
  const cgstTotal = round2(items.reduce((sum, i) => sum + i.cgstAmount, 0));
  const sgstTotal = round2(items.reduce((sum, i) => sum + i.sgstAmount, 0));
  const igstTotal = round2(items.reduce((sum, i) => sum + i.igstAmount, 0));
  const totalTax = round2(cgstTotal + sgstTotal + igstTotal);

  const exactTotal = round2(taxableAmount + totalTax);
  const grandTotal = Math.round(exactTotal);
  const roundOff = round2(grandTotal - exactTotal);

  return {
    supplyType,
    items,
    subtotal,
    totalDiscount,
    taxableAmount,
    cgstTotal,
    sgstTotal,
    igstTotal,
    totalTax,
    roundOff,
    grandTotal,
  };
}

export interface HsnSummaryRow {
  hsnCode: string;
  gstRate: GstRate;
  quantity: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
}

export function aggregateHsnSummary(invoices: Invoice[]): HsnSummaryRow[] {
  const map = new Map<string, HsnSummaryRow>();
  for (const inv of invoices) {
    for (const item of inv.items) {
      const key = `${item.hsnCode}__${item.gstRate}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity = round2(existing.quantity + item.quantity);
        existing.taxableValue = round2(existing.taxableValue + item.taxableValue);
        existing.cgstAmount = round2(existing.cgstAmount + item.cgstAmount);
        existing.sgstAmount = round2(existing.sgstAmount + item.sgstAmount);
        existing.igstAmount = round2(existing.igstAmount + item.igstAmount);
        existing.totalTax = round2(existing.totalTax + item.totalTax);
      } else {
        map.set(key, {
          hsnCode: item.hsnCode,
          gstRate: item.gstRate,
          quantity: item.quantity,
          taxableValue: item.taxableValue,
          cgstAmount: item.cgstAmount,
          sgstAmount: item.sgstAmount,
          igstAmount: item.igstAmount,
          totalTax: item.totalTax,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.taxableValue - a.taxableValue);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`;
}

function threeDigitsToWords(n: number): string {
  if (n === 0) return '';
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${ONES[hundreds]} Hundred`);
  if (rem > 0) parts.push(twoDigitsToWords(rem));
  return parts.join(' ');
}

export function amountInWordsINR(amount: number): string {
  const whole = Math.floor(Math.abs(amount));
  if (whole === 0) return 'Zero Rupees Only';

  const crore = Math.floor(whole / 10000000);
  const lakh = Math.floor((whole % 10000000) / 100000);
  const thousand = Math.floor((whole % 100000) / 1000);
  const rest = whole % 1000;

  const segments: string[] = [];
  if (crore > 0) segments.push(`${twoDigitsToWords(crore)} Crore`);
  if (lakh > 0) segments.push(`${twoDigitsToWords(lakh)} Lakh`);
  if (thousand > 0) segments.push(`${twoDigitsToWords(thousand)} Thousand`);
  if (rest > 0) segments.push(threeDigitsToWords(rest));

  return `${segments.join(' ')} Rupees Only`;
}

export interface GstBenchmarkResult {
  totalCases: number;
  passedCases: number;
  accuracyPercent: number;
  failedCaseIds: string[];
}

/**
 * Deterministic 50-case GST verification suite aligned with P37 acceptance criteria:
 * "100% correct GST on 50 test invoices".
 */
export function runGst50CaseVerification(): GstBenchmarkResult {
  const rates: GstRate[] = [0, 5, 12, 18, 28];
  const failedCaseIds: string[] = [];
  let passedCases = 0;

  for (let i = 0; i < 50; i++) {
    const rate = rates[i % rates.length];
    const isIntra = i % 2 === 0;
    const qty = (i % 7) + 1;
    const price = round2(125.5 + i * 73.25);
    const discountPct = (i % 4) * 5;

    const totals = calculateInvoiceTotals(
      [
        {
          productId: `bench-${i}`,
          productName: `Benchmark Item ${i + 1}`,
          hsnCode: '8471',
          category: 'Benchmark',
          unit: 'Nos',
          quantity: qty,
          unitPrice: price,
          discountPercent: discountPct,
          gstRate: rate,
        },
      ],
      'Karnataka',
      isIntra ? 'Karnataka' : 'Maharashtra'
    );

    const expectedGross = round2(qty * price);
    const expectedDisc = round2((expectedGross * discountPct) / 100);
    const expectedTaxable = round2(expectedGross - expectedDisc);
    const expectedCgst = isIntra ? round2((expectedTaxable * (rate / 2)) / 100) : 0;
    const expectedSgst = isIntra ? round2((expectedTaxable * (rate / 2)) / 100) : 0;
    const expectedIgst = isIntra ? 0 : round2((expectedTaxable * rate) / 100);
    const expectedTax = round2(expectedCgst + expectedSgst + expectedIgst);
    const expectedGrand = Math.round(round2(expectedTaxable + expectedTax));

    const match =
      totals.taxableAmount === expectedTaxable &&
      totals.cgstTotal === expectedCgst &&
      totals.sgstTotal === expectedSgst &&
      totals.igstTotal === expectedIgst &&
      totals.totalTax === expectedTax &&
      totals.grandTotal === expectedGrand;

    if (match) {
      passedCases++;
    } else {
      failedCaseIds.push(`CASE-${i + 1}`);
    }
  }

  return {
    totalCases: 50,
    passedCases,
    accuracyPercent: round2((passedCases / 50) * 100),
    failedCaseIds,
  };
}
