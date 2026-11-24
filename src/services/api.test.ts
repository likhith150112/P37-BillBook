import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ApiError,
  createInvoiceApi,
  fetchBootstrapData,
  normalizeCustomer,
  normalizeInvoice,
  normalizeProduct,
} from './api.ts';
import type { Invoice } from '../types/billing.ts';

test('normalizers convert Spring Boot numeric IDs and BigDecimal values cleanly', () => {
  const customer = normalizeCustomer({
    id: 42,
    name: 'Arjun Nair',
    businessName: 'Kaveri Systems',
    gstin: '29AAACK9182D1ZP',
    email: 'billing@kaveri.example',
    phone: '+91 98450 11203',
    address: '18 MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    createdAt: '2026-10-01T10:15:00',
  });
  assert.equal(customer.id, '42');
  assert.equal(customer.createdAt, '2026-10-01');

  const product = normalizeProduct({
    id: 7,
    sku: 'BB-IT-01',
    name: 'Laptop',
    hsnCode: '8471',
    category: 'IT Hardware',
    unitPrice: 54500.0,
    gstRate: 18,
    unit: 'Nos',
    stockQty: 12,
    autoCategorised: true,
  });
  assert.equal(product.id, '7');
  assert.equal(product.gstRate, 18);

  const invoice = normalizeInvoice({
    id: 101,
    invoiceNumber: 'BB-2026-0101',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    customerId: 42,
    customerName: 'Kaveri Systems',
    customerState: 'Karnataka',
    customerAddress: 'Bengaluru',
    supplyType: 'INTRA_STATE',
    subtotal: 10000,
    totalDiscount: 0,
    taxableAmount: 10000,
    cgstTotal: 900,
    sgstTotal: 900,
    igstTotal: 0,
    totalTax: 1800,
    roundOff: 0,
    grandTotal: 11800,
    amountPaid: 0,
    paymentStatus: 'PENDING',
    hasUnreviewedAnomalies: false,
    items: [
      {
        id: 1,
        productId: 7,
        productName: 'Laptop',
        hsnCode: '8471',
        category: 'IT Hardware',
        unit: 'Nos',
        quantity: 1,
        unitPrice: 10000,
        discountPercent: 0,
        gstRate: 18,
        grossAmount: 10000,
        discountAmount: 0,
        taxableValue: 10000,
        cgstAmount: 900,
        sgstAmount: 900,
        igstAmount: 0,
        totalTax: 1800,
        lineTotal: 11800,
      },
    ],
    anomalies: [],
  });
  assert.equal(invoice.id, '101');
  assert.equal(invoice.items[0]?.cgstRate, 9);
  assert.equal(invoice.items[0]?.sgstRate, 9);
  assert.equal(invoice.items[0]?.igstRate, 0);
});

test('Production Mode API client rejects with ApiError on network outage and never falls back to mock data', async () => {
  const failingFetch: typeof fetch = async () => {
    throw new TypeError('connect ECONNREFUSED 127.0.0.1:8080');
  };

  await assert.rejects(
    () => fetchBootstrapData('http://localhost:8080/api', failingFetch),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.code, 'BACKEND_UNREACHABLE');
      assert.match(err.message, /Cannot reach Spring Boot backend/);
      return true;
    }
  );
});

test('Production Mode API client propagates HTTP 400/500 backend errors faithfully', async () => {
  const errorResponseFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: 'VALIDATION_FAILED',
        message: 'Customer not found: 999',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );

  const sampleInvoice: Invoice = {
    id: 'inv-1',
    invoiceNumber: 'BB-2026-0999',
    issueDate: '2026-11-24',
    dueDate: '2026-12-09',
    customerId: '999',
    customerName: 'Unknown',
    customerState: 'Karnataka',
    customerAddress: 'Bengaluru',
    supplyType: 'INTRA_STATE',
    items: [],
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    totalTax: 0,
    roundOff: 0,
    grandTotal: 0,
    amountPaid: 0,
    paymentStatus: 'PENDING',
    anomalies: [],
    hasUnreviewedAnomalies: false,
    createdAt: '2026-11-24T10:00:00Z',
  };

  await assert.rejects(
    () =>
      createInvoiceApi(
        sampleInvoice,
        false,
        'http://localhost:8080/api',
        errorResponseFetch
      ),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 400);
      assert.equal(err.code, 'VALIDATION_FAILED');
      assert.equal(err.message, 'Customer not found: 999');
      return true;
    }
  );
});
