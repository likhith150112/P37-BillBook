import assert from 'node:assert/strict';
import test from 'node:test';
import { buildInitialInvoices, INITIAL_PRODUCTS } from '../data/seedData.ts';
import {
  detectInvoiceAnomalies,
  evaluateAnomalyDetectionRecall,
} from './anomalyDetector.ts';
import {
  getExpectedGstForHsn,
  suggestProductCategorisation,
} from './categorizer.ts';
import {
  aggregateHsnSummary,
  amountInWordsINR,
  calculateInvoiceTotals,
  calculateLineItem,
  determineSupplyType,
  runGst50CaseVerification,
} from './gstCalculator.ts';

test('determineSupplyType splits intra-state vs inter-state deterministically', () => {
  assert.equal(determineSupplyType('Karnataka', 'Karnataka'), 'INTRA_STATE');
  assert.equal(determineSupplyType('karnataka ', 'Karnataka'), 'INTRA_STATE');
  assert.equal(determineSupplyType('Karnataka', 'Maharashtra'), 'INTER_STATE');
});

test('calculateLineItem splits CGST & SGST 50/50 for intra-state and uses IGST for inter-state', () => {
  const baseLine = {
    productId: 'p1',
    productName: 'ThinkBook Laptop',
    hsnCode: '8471',
    category: 'IT Hardware & Computing',
    unit: 'Nos',
    quantity: 2,
    unitPrice: 50000,
    discountPercent: 10,
    gstRate: 18 as const,
  };

  const intra = calculateLineItem(baseLine, 'INTRA_STATE', 'l1');
  assert.equal(intra.grossAmount, 100000);
  assert.equal(intra.discountAmount, 10000);
  assert.equal(intra.taxableValue, 90000);
  assert.equal(intra.cgstRate, 9);
  assert.equal(intra.sgstRate, 9);
  assert.equal(intra.igstRate, 0);
  assert.equal(intra.cgstAmount, 8100);
  assert.equal(intra.sgstAmount, 8100);
  assert.equal(intra.igstAmount, 0);
  assert.equal(intra.totalTax, 16200);
  assert.equal(intra.lineTotal, 106200);

  const inter = calculateLineItem(baseLine, 'INTER_STATE', 'l2');
  assert.equal(inter.cgstAmount, 0);
  assert.equal(inter.sgstAmount, 0);
  assert.equal(inter.igstRate, 18);
  assert.equal(inter.igstAmount, 16200);
  assert.equal(inter.lineTotal, 106200);
});

test('50-case deterministic GST verification benchmark passes 100%', () => {
  const result = runGst50CaseVerification();
  assert.equal(result.totalCases, 50);
  assert.equal(result.passedCases, 50);
  assert.equal(result.accuracyPercent, 100);
  assert.deepEqual(result.failedCaseIds, []);
});

test('suggestProductCategorisation returns advisory HSN & GST slab without mutating inputs', () => {
  const laptop = suggestProductCategorisation('Dell Latitude Laptop 15 inch');
  assert.equal(laptop.hsnCode, '8471');
  assert.equal(laptop.suggestedGstRate, 18);
  assert.equal(laptop.advisoryOnly, true);

  const rice = suggestProductCategorisation('Organic Basmati Rice 10kg');
  assert.equal(rice.hsnCode, '1006');
  assert.equal(rice.suggestedGstRate, 5);

  const book = suggestProductCategorisation('Printed Tax Handbook');
  assert.equal(book.hsnCode, '4901');
  assert.equal(book.suggestedGstRate, 0);
  assert.equal(getExpectedGstForHsn('8415'), 28);
});

test('anomaly detection flags discount, GST mismatch, quantity spike, and achieves >=70% recall on seeded cases', () => {
  const invoices = buildInitialInvoices();
  const metrics = evaluateAnomalyDetectionRecall(invoices);

  assert.ok(metrics.totalInjectedAnomalies >= 3);
  assert.ok(
    metrics.recallPercent >= 70,
    `Expected >=70% anomaly recall, got ${metrics.recallPercent}%`
  );
  assert.equal(metrics.recallPercent, 100);

  const sampleTotals = calculateInvoiceTotals(
    [
      {
        productId: 'prod-01',
        productName: 'ThinkBook 14 Business Laptop',
        hsnCode: '8471',
        category: 'IT Hardware & Computing',
        unit: 'Nos',
        quantity: 1,
        unitPrice: 12000,
        discountPercent: 40,
        gstRate: 5,
      },
    ],
    'Karnataka',
    'Karnataka'
  );

  const flags = detectInvoiceAnomalies(
    {
      issueDate: '2026-11-20',
      customerId: 'cust-01',
      customerName: 'Kaveri Systems',
      items: sampleTotals.items,
      grandTotal: sampleTotals.grandTotal,
    },
    invoices,
    INITIAL_PRODUCTS
  );

  const ruleCodes = flags.map((f) => f.ruleCode);
  assert.ok(ruleCodes.includes('ANOM_EXCESS_DISCOUNT'));
  assert.ok(ruleCodes.includes('ANOM_GST_HSN_MISMATCH'));
  assert.ok(ruleCodes.includes('ANOM_UNIT_PRICE_DROP'));
});

test('HSN summary & INR amount-in-words format accurately', () => {
  const invoices = buildInitialInvoices();
  const summary = aggregateHsnSummary(invoices.slice(0, 2));
  assert.ok(summary.length >= 2);
  assert.equal(amountInWordsINR(125400), 'One Lakh Twenty Five Thousand Four Hundred Rupees Only');
});
