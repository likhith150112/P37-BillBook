import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  buildInitialInvoices,
  DEFAULT_SELLER_PROFILE,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
} from '../data/seedData.ts';
import type { GstRate, Invoice } from '../types/billing.ts';
import { detectInvoiceAnomalies } from './anomalyDetector.ts';
import { calculateInvoiceTotals } from './gstCalculator.ts';

interface GstDatasetRow {
  caseId: string;
  sellerState: string;
  customerState: string;
  expectedSupplyType: 'INTRA_STATE' | 'INTER_STATE';
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstRate: GstRate;
  expectedGross: number;
  expectedDiscount: number;
  expectedTaxableValue: number;
  expectedCgst: number;
  expectedSgst: number;
  expectedIgst: number;
  expectedTotalTax: number;
  expectedRoundOff: number;
  expectedGrandTotal: number;
}

interface AnomalyDatasetRow {
  caseId: string;
  label: 'NORMAL' | 'ANOMALY';
  injectedRule: string;
  customerId: string;
  issueDate: string;
  productId: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstRate: GstRate;
  notes: string;
}

test('50 GST test invoices dataset achieves 100% deterministic calculation accuracy', () => {
  const datasetPath = path.resolve(process.cwd(), 'tests/datasets/gst_50_test_invoices.json');
  const rows = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as GstDatasetRow[];

  assert.equal(rows.length, 50);

  let passed = 0;
  for (const row of rows) {
    const res = calculateInvoiceTotals(
      [
        {
          productId: row.caseId,
          productName: `Test Product ${row.hsnCode}`,
          hsnCode: row.hsnCode,
          category: 'Dataset Verification',
          unit: 'Nos',
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          discountPercent: row.discountPercent,
          gstRate: row.gstRate,
        },
      ],
      row.sellerState,
      row.customerState
    );

    assert.equal(res.supplyType, row.expectedSupplyType, `${row.caseId} supplyType`);
    assert.equal(res.subtotal, row.expectedGross, `${row.caseId} subtotal`);
    assert.equal(res.totalDiscount, row.expectedDiscount, `${row.caseId} totalDiscount`);
    assert.equal(res.taxableAmount, row.expectedTaxableValue, `${row.caseId} taxableAmount`);
    assert.equal(res.cgstTotal, row.expectedCgst, `${row.caseId} cgstTotal`);
    assert.equal(res.sgstTotal, row.expectedSgst, `${row.caseId} sgstTotal`);
    assert.equal(res.igstTotal, row.expectedIgst, `${row.caseId} igstTotal`);
    assert.equal(res.totalTax, row.expectedTotalTax, `${row.caseId} totalTax`);
    assert.equal(res.roundOff, row.expectedRoundOff, `${row.caseId} roundOff`);
    assert.equal(res.grandTotal, row.expectedGrandTotal, `${row.caseId} grandTotal`);
    passed++;
  }

  assert.equal(passed, 50);
});

test('Labeled anomaly dataset achieves >=70% anomaly recall with zero false positives on normal invoices', () => {
  const datasetPath = path.resolve(process.cwd(), 'tests/datasets/anomaly_labeled_dataset.json');
  const rows = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as AnomalyDatasetRow[];

  assert.equal(rows.length, 20);

  const history: Invoice[] = [...buildInitialInvoices()];
  let truePositives = 0;
  let totalInjected = 0;
  let falsePositives = 0;

  for (const row of rows) {
    const customer = INITIAL_CUSTOMERS.find((c) => c.id === row.customerId)!;
    const product = INITIAL_PRODUCTS.find((p) => p.id === row.productId)!;
    const totals = calculateInvoiceTotals(
      [
        {
          productId: product.id,
          productName: product.name,
          hsnCode: row.hsnCode,
          category: product.category,
          unit: product.unit,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          discountPercent: row.discountPercent,
          gstRate: row.gstRate,
        },
      ],
      DEFAULT_SELLER_PROFILE.state,
      customer.state
    );

    const flags = detectInvoiceAnomalies(
      {
        issueDate: row.issueDate,
        customerId: customer.id,
        customerName: customer.businessName || customer.name,
        items: totals.items,
        grandTotal: totals.grandTotal,
      },
      history,
      INITIAL_PRODUCTS
    );

    if (row.label === 'ANOMALY') {
      totalInjected++;
      const matchedExpectedRule = flags.some((f) => f.ruleCode === row.injectedRule);
      if (matchedExpectedRule) {
        truePositives++;
      }
    } else if (flags.length > 0) {
      falsePositives++;
    }

    history.push({
      id: row.caseId,
      invoiceNumber: `DS-${row.caseId}`,
      issueDate: row.issueDate,
      dueDate: row.issueDate,
      customerId: customer.id,
      customerName: customer.businessName || customer.name,
      customerState: customer.state,
      customerAddress: customer.city,
      supplyType: totals.supplyType,
      items: totals.items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      taxableAmount: totals.taxableAmount,
      cgstTotal: totals.cgstTotal,
      sgstTotal: totals.sgstTotal,
      igstTotal: totals.igstTotal,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountPaid: 0,
      paymentStatus: 'PENDING',
      anomalies: flags,
      hasUnreviewedAnomalies: flags.length > 0,
      createdAt: `${row.issueDate}T10:00:00Z`,
    });
  }

  const recall = (truePositives / totalInjected) * 100;
  assert.ok(recall >= 70, `Expected >=70% recall on labeled dataset, got ${recall.toFixed(2)}%`);
  assert.equal(recall, 100);
  assert.equal(falsePositives, 0);
});
