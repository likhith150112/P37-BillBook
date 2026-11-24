import type {
  AnomalyFlag,
  CalculatedLineItem,
  Invoice,
  Product,
} from '../types/billing.ts';
import { getExpectedGstForHsn } from './categorizer.ts';
import { formatINR, round2 } from './gstCalculator.ts';

export interface AnomalyCheckInput {
  invoiceId?: string;
  issueDate: string;
  customerId: string;
  customerName: string;
  items: CalculatedLineItem[];
  grandTotal: number;
}

export interface AnomalyDetectionMetrics {
  totalInjectedAnomalies: number;
  detectedInjectedAnomalies: number;
  recallPercent: number;
  totalFlaggedInvoices: number;
  totalAlerts: number;
  unreviewedAlerts: number;
}

function meanAndStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / values.length;
  return { mean, std: Math.sqrt(variance) };
}

export function detectInvoiceAnomalies(
  candidate: AnomalyCheckInput,
  historicalInvoices: Invoice[],
  catalogProducts: Product[]
): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];
  const otherInvoices = historicalInvoices.filter(
    (inv) => inv.id !== candidate.invoiceId
  );

  // 1. Statistical Z-score / outlier check on Grand Total
  const totals = otherInvoices.map((inv) => inv.grandTotal).filter((v) => v > 0);
  if (totals.length >= 4 && candidate.grandTotal > 0) {
    const { mean, std } = meanAndStd(totals);
    const zScore = std > 0 ? (candidate.grandTotal - mean) / std : 0;
    if (zScore >= 2.0 || candidate.grandTotal >= mean * 2.75) {
      flags.push({
        id: `anom-total-${Date.now()}`,
        ruleCode: 'ANOM_ZSCORE_TOTAL',
        severity: zScore >= 3.0 || candidate.grandTotal >= mean * 4 ? 'HIGH' : 'MEDIUM',
        title: 'Unusually High Invoice Total',
        explanation: `Invoice grand total (${formatINR(candidate.grandTotal)}) is ${zScore.toFixed(2)} standard deviations above historical average (${formatINR(mean)}). Verify quantities and unit pricing before issuing.`,
        metricValue: formatINR(candidate.grandTotal),
        baselineValue: `Mean ${formatINR(mean)} (σ ${formatINR(std)})`,
        reviewed: false,
      });
    }
  }

  // 2. Line-level checks: excessive discount, quantity spike, HSN-GST mismatch, underpricing
  candidate.items.forEach((line, idx) => {
    if (line.discountPercent > 25) {
      flags.push({
        id: `anom-disc-${idx}-${line.productId}`,
        ruleCode: 'ANOM_EXCESS_DISCOUNT',
        severity: line.discountPercent >= 45 ? 'HIGH' : 'MEDIUM',
        title: `Excessive Discount on "${line.productName}"`,
        explanation: `Line discount of ${line.discountPercent}% exceeds the 25% standard commercial threshold, reducing taxable value by ${formatINR(line.discountAmount)}.`,
        metricValue: `${line.discountPercent}%`,
        baselineValue: '<= 25%',
        reviewed: false,
      });
    }

    if (line.quantity >= 40) {
      flags.push({
        id: `anom-qty-${idx}-${line.productId}`,
        ruleCode: 'ANOM_QTY_OUTLIER',
        severity: line.quantity >= 100 ? 'HIGH' : 'MEDIUM',
        title: `Quantity Spike on "${line.productName}"`,
        explanation: `Billed quantity (${line.quantity} ${line.unit}) is unusually high for a single SME line item. Confirm against purchase order.`,
        metricValue: `${line.quantity} ${line.unit}`,
        baselineValue: '< 40 units/line',
        reviewed: false,
      });
    }

    const expectedGst = getExpectedGstForHsn(line.hsnCode);
    if (expectedGst !== null && expectedGst !== line.gstRate) {
      flags.push({
        id: `anom-gst-${idx}-${line.productId}`,
        ruleCode: 'ANOM_GST_HSN_MISMATCH',
        severity: 'HIGH',
        title: `GST Rate Mismatch for HSN ${line.hsnCode}`,
        explanation: `"${line.productName}" uses HSN ${line.hsnCode} with ${line.gstRate}% GST, but standard Indian GST schedule maps HSN ${line.hsnCode} to ${expectedGst}%.`,
        metricValue: `${line.gstRate}%`,
        baselineValue: `${expectedGst}% (HSN ${line.hsnCode})`,
        reviewed: false,
      });
    }

    const catalogItem = catalogProducts.find((p) => p.id === line.productId);
    if (catalogItem && catalogItem.unitPrice > 0) {
      const priceDiffRatio =
        (catalogItem.unitPrice - line.unitPrice) / catalogItem.unitPrice;
      if (priceDiffRatio >= 0.4 || line.unitPrice <= 0) {
        flags.push({
          id: `anom-price-${idx}-${line.productId}`,
          ruleCode: 'ANOM_UNIT_PRICE_DROP',
          severity: line.unitPrice <= 0 ? 'HIGH' : 'MEDIUM',
          title: `Under-Priced Line Item "${line.productName}"`,
          explanation: `Unit price (${formatINR(line.unitPrice)}) is ${Math.round(priceDiffRatio * 100)}% below catalog list price (${formatINR(catalogItem.unitPrice)}).`,
          metricValue: formatINR(line.unitPrice),
          baselineValue: formatINR(catalogItem.unitPrice),
          reviewed: false,
        });
      }
    }
  });

  // 3. Duplicate billing risk (same customer & near-identical amount within 3 days)
  const candidateDateMs = new Date(candidate.issueDate).getTime();
  const duplicate = otherInvoices.find((inv) => {
    if (inv.customerId !== candidate.customerId) return false;
    const diffDays =
      Math.abs(new Date(inv.issueDate).getTime() - candidateDateMs) /
      (1000 * 60 * 60 * 24);
    const amountClose = Math.abs(inv.grandTotal - candidate.grandTotal) <= 1;
    return diffDays <= 3 && amountClose && candidate.grandTotal > 0;
  });

  if (duplicate) {
    flags.push({
      id: `anom-dup-${duplicate.invoiceNumber}`,
      ruleCode: 'ANOM_DUPLICATE_INVOICE',
      severity: 'HIGH',
      title: 'Potential Duplicate Invoice',
      explanation: `Matches ${duplicate.invoiceNumber} (${duplicate.customerName}) for ${formatINR(duplicate.grandTotal)} issued on ${duplicate.issueDate}. Verify this is not a double entry.`,
      metricValue: `${candidate.issueDate} · ${formatINR(candidate.grandTotal)}`,
      baselineValue: `${duplicate.invoiceNumber} (${duplicate.issueDate})`,
      reviewed: false,
    });
  }

  return flags;
}

export function evaluateAnomalyDetectionRecall(
  invoices: Invoice[]
): AnomalyDetectionMetrics {
  const injected = invoices.filter((inv) => inv.injectedAnomalyGroundTruth);
  const detectedInjected = injected.filter((inv) => inv.anomalies.length > 0);
  const flaggedInvoices = invoices.filter((inv) => inv.anomalies.length > 0);
  const allAlerts = invoices.flatMap((inv) => inv.anomalies);
  const unreviewedAlerts = allAlerts.filter((a) => !a.reviewed);

  const recallPercent =
    injected.length > 0
      ? round2((detectedInjected.length / injected.length) * 100)
      : 100;

  return {
    totalInjectedAnomalies: injected.length,
    detectedInjectedAnomalies: detectedInjected.length,
    recallPercent,
    totalFlaggedInvoices: flaggedInvoices.length,
    totalAlerts: allAlerts.length,
    unreviewedAlerts: unreviewedAlerts.length,
  };
}
