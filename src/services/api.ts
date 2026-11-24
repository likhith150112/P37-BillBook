import type {
  AnomalyFlag,
  AuditLogEntry,
  CalculatedLineItem,
  CategorySuggestion,
  Customer,
  GstRate,
  Invoice,
  PaymentStatus,
  Product,
  TaxSupplyType,
} from '../types/billing.ts';

export class ApiError extends Error {
  readonly status?: number;
  readonly code: string;

  constructor(message: string, code = 'API_ERROR', status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export type FetchLike = typeof fetch;

export function getApiBaseUrl(): string {
  const envBase =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof import.meta.env.VITE_API_BASE_URL === 'string'
      ? import.meta.env.VITE_API_BASE_URL.trim()
      : '';
  const base = envBase || 'http://localhost:8080/api';
  return base.replace(/\/+$/, '');
}

function toNum(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toGstRate(value: unknown): GstRate {
  const n = toNum(value, 18);
  if (n === 0 || n === 5 || n === 12 || n === 18 || n === 28) return n;
  return 18;
}

export function normalizeCustomer(raw: Record<string, unknown>): Customer {
  const createdRaw = raw.createdAt ? String(raw.createdAt) : new Date().toISOString();
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    businessName: raw.businessName ? String(raw.businessName) : undefined,
    gstin: raw.gstin ? String(raw.gstin) : undefined,
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    address: String(raw.address ?? ''),
    city: String(raw.city ?? ''),
    state: String(raw.state ?? ''),
    pincode: String(raw.pincode ?? ''),
    createdAt: createdRaw.slice(0, 10),
  };
}

export function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    id: String(raw.id ?? ''),
    sku: String(raw.sku ?? ''),
    name: String(raw.name ?? ''),
    description: raw.description ? String(raw.description) : undefined,
    hsnCode: String(raw.hsnCode ?? ''),
    category: String(raw.category ?? ''),
    unitPrice: toNum(raw.unitPrice),
    gstRate: toGstRate(raw.gstRate),
    unit: String(raw.unit ?? 'Nos'),
    stockQty: Math.trunc(toNum(raw.stockQty)),
    autoCategorised: Boolean(raw.autoCategorised),
    categorisationRule: raw.categorisationRule
      ? String(raw.categorisationRule)
      : undefined,
  };
}

function normalizeLineItem(
  raw: Record<string, unknown>,
  supplyType: TaxSupplyType
): CalculatedLineItem {
  const gstRate = toGstRate(raw.gstRate);
  const cgstRate =
    raw.cgstRate !== undefined
      ? toNum(raw.cgstRate)
      : supplyType === 'INTRA_STATE'
        ? gstRate / 2
        : 0;
  const sgstRate =
    raw.sgstRate !== undefined
      ? toNum(raw.sgstRate)
      : supplyType === 'INTRA_STATE'
        ? gstRate / 2
        : 0;
  const igstRate =
    raw.igstRate !== undefined
      ? toNum(raw.igstRate)
      : supplyType === 'INTER_STATE'
        ? gstRate
        : 0;

  return {
    id: String(raw.id ?? ''),
    productId: raw.productId !== null && raw.productId !== undefined ? String(raw.productId) : '',
    productName: String(raw.productName ?? ''),
    hsnCode: String(raw.hsnCode ?? ''),
    category: String(raw.category ?? ''),
    unit: String(raw.unit ?? 'Nos'),
    quantity: Math.trunc(toNum(raw.quantity)),
    unitPrice: toNum(raw.unitPrice),
    discountPercent: toNum(raw.discountPercent),
    gstRate,
    grossAmount: toNum(raw.grossAmount),
    discountAmount: toNum(raw.discountAmount),
    taxableValue: toNum(raw.taxableValue),
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount: toNum(raw.cgstAmount),
    sgstAmount: toNum(raw.sgstAmount),
    igstAmount: toNum(raw.igstAmount),
    totalTax: toNum(raw.totalTax),
    lineTotal: toNum(raw.lineTotal),
  };
}

function normalizeAnomaly(raw: Record<string, unknown>): AnomalyFlag {
  const sev = String(raw.severity ?? 'MEDIUM').toUpperCase();
  const severity: AnomalyFlag['severity'] =
    sev === 'HIGH' || sev === 'LOW' ? sev : 'MEDIUM';
  return {
    id: String(raw.id ?? ''),
    ruleCode: String(raw.ruleCode ?? ''),
    severity,
    title: String(raw.title ?? ''),
    explanation: String(raw.explanation ?? ''),
    metricValue: String(raw.metricValue ?? ''),
    baselineValue: String(raw.baselineValue ?? ''),
    reviewed: Boolean(raw.reviewed),
    reviewerNote: raw.reviewerNote ? String(raw.reviewerNote) : undefined,
  };
}

export function normalizeInvoice(raw: Record<string, unknown>): Invoice {
  const supplyType: TaxSupplyType =
    raw.supplyType === 'INTER_STATE' ? 'INTER_STATE' : 'INTRA_STATE';
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const rawAnoms = Array.isArray(raw.anomalies) ? raw.anomalies : [];

  const items = rawItems.map((it) =>
    normalizeLineItem(it as Record<string, unknown>, supplyType)
  );
  const anomalies = rawAnoms.map((a) =>
    normalizeAnomaly(a as Record<string, unknown>)
  );

  const hasUnreviewed =
    typeof raw.hasUnreviewedAnomalies === 'boolean'
      ? raw.hasUnreviewedAnomalies
      : anomalies.some((a) => !a.reviewed);

  return {
    id: String(raw.id ?? ''),
    invoiceNumber: String(raw.invoiceNumber ?? ''),
    issueDate: String(raw.issueDate ?? '').slice(0, 10),
    dueDate: String(raw.dueDate ?? '').slice(0, 10),
    customerId: String(raw.customerId ?? ''),
    customerName: String(raw.customerName ?? ''),
    customerGstin: raw.customerGstin ? String(raw.customerGstin) : undefined,
    customerState: String(raw.customerState ?? ''),
    customerAddress: String(raw.customerAddress ?? ''),
    supplyType,
    items,
    subtotal: toNum(raw.subtotal),
    totalDiscount: toNum(raw.totalDiscount),
    taxableAmount: toNum(raw.taxableAmount),
    cgstTotal: toNum(raw.cgstTotal),
    sgstTotal: toNum(raw.sgstTotal),
    igstTotal: toNum(raw.igstTotal),
    totalTax: toNum(raw.totalTax),
    roundOff: toNum(raw.roundOff),
    grandTotal: toNum(raw.grandTotal),
    amountPaid: toNum(raw.amountPaid),
    paymentStatus: (String(raw.paymentStatus ?? 'PENDING') as PaymentStatus),
    notes: raw.notes ? String(raw.notes) : undefined,
    anomalies,
    hasUnreviewedAnomalies: hasUnreviewed,
    injectedAnomalyGroundTruth: Boolean(raw.injectedAnomalyGroundTruth),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export function normalizeAuditLog(raw: Record<string, unknown>): AuditLogEntry {
  return {
    id: String(raw.id ?? ''),
    timestamp: String(raw.timestamp ?? ''),
    action: (String(raw.action ?? 'GST_BENCHMARK_RUN') as AuditLogEntry['action']),
    entityRef: String(raw.entityRef ?? ''),
    actor: String(raw.actor ?? ''),
    details: String(raw.details ?? ''),
  };
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<T> {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Network error';
    throw new ApiError(
      `Cannot reach Spring Boot backend at ${baseUrl} (${detail}). Ensure MySQL and Spring Boot are running.`,
      'BACKEND_UNREACHABLE'
    );
  }

  if (!response.ok) {
    let message = `Spring Boot API returned HTTP ${response.status}`;
    let code = `HTTP_${response.status}`;
    try {
      const errBody = (await response.json()) as Record<string, unknown>;
      if (typeof errBody.message === 'string' && errBody.message) {
        message = errBody.message;
      }
      if (typeof errBody.error === 'string' && errBody.error) {
        code = errBody.error;
      }
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(message, code, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const rawText = await response.text();
  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new ApiError(
      `Spring Boot backend at ${baseUrl} returned a non-JSON response. Verify Spring Boot is running on port 8080.`,
      'INVALID_BACKEND_RESPONSE',
      response.status
    );
  }
}

export async function fetchBootstrapData(
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<{
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  auditLogs: AuditLogEntry[];
}> {
  const [rawCustomers, rawProducts, rawInvoices, rawLogs] = await Promise.all([
    requestJson<Array<Record<string, unknown>>>('/customers', {}, baseUrl, fetchImpl),
    requestJson<Array<Record<string, unknown>>>('/products', {}, baseUrl, fetchImpl),
    requestJson<Array<Record<string, unknown>>>('/invoices', {}, baseUrl, fetchImpl),
    requestJson<Array<Record<string, unknown>>>('/audit-logs', {}, baseUrl, fetchImpl),
  ]);

  return {
    customers: rawCustomers.map(normalizeCustomer),
    products: rawProducts.map(normalizeProduct),
    invoices: rawInvoices.map(normalizeInvoice),
    auditLogs: rawLogs.map(normalizeAuditLog),
  };
}

export async function createCustomerApi(
  payload: Omit<Customer, 'id' | 'createdAt'>,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Customer> {
  const raw = await requestJson<Record<string, unknown>>(
    '/customers',
    { method: 'POST', body: JSON.stringify(payload) },
    baseUrl,
    fetchImpl
  );
  return normalizeCustomer(raw);
}

export async function updateCustomerApi(
  customer: Customer,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Customer> {
  const raw = await requestJson<Record<string, unknown>>(
    `/customers/${encodeURIComponent(customer.id)}`,
    { method: 'PUT', body: JSON.stringify(customer) },
    baseUrl,
    fetchImpl
  );
  return normalizeCustomer(raw);
}

export async function deleteCustomerApi(
  customerId: string,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<void> {
  await requestJson<void>(
    `/customers/${encodeURIComponent(customerId)}`,
    { method: 'DELETE' },
    baseUrl,
    fetchImpl
  );
}

export async function suggestCategoryApi(
  name: string,
  description = '',
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<CategorySuggestion> {
  const raw = await requestJson<Record<string, unknown>>(
    '/products/suggest-category',
    { method: 'POST', body: JSON.stringify({ name, description }) },
    baseUrl,
    fetchImpl
  );
  return {
    category: String(raw.category ?? 'General Merchandise'),
    hsnCode: String(raw.hsnCode ?? '9999'),
    suggestedGstRate: toGstRate(raw.suggestedGstRate),
    confidence: toNum(raw.confidence, 0.5),
    matchedKeywords: Array.isArray(raw.matchedKeywords)
      ? raw.matchedKeywords.map(String)
      : [],
    explanation: String(raw.explanation ?? ''),
    advisoryOnly: true,
  };
}

export async function createProductApi(
  payload: Omit<Product, 'id'>,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Product> {
  const raw = await requestJson<Record<string, unknown>>(
    '/products',
    { method: 'POST', body: JSON.stringify(payload) },
    baseUrl,
    fetchImpl
  );
  return normalizeProduct(raw);
}

export async function updateProductApi(
  product: Product,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Product> {
  const raw = await requestJson<Record<string, unknown>>(
    `/products/${encodeURIComponent(product.id)}`,
    { method: 'PUT', body: JSON.stringify(product) },
    baseUrl,
    fetchImpl
  );
  return normalizeProduct(raw);
}

export async function deleteProductApi(
  productId: string,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<void> {
  await requestJson<void>(
    `/products/${encodeURIComponent(productId)}`,
    { method: 'DELETE' },
    baseUrl,
    fetchImpl
  );
}

export interface CreateInvoicePayload {
  invoiceNumber?: string;
  customerId: number;
  issueDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  anomalyConfirmed: boolean;
  items: Array<{
    productId: number | null;
    productName: string;
    hsnCode: string;
    category: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    gstRate: GstRate;
  }>;
}

export async function createInvoiceApi(
  invoice: Invoice,
  anomalyConfirmed: boolean,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Invoice> {
  const numericCustomerId = Number(invoice.customerId);
  if (!Number.isFinite(numericCustomerId)) {
    throw new ApiError(
      'Selected customer does not have a valid database ID.',
      'INVALID_CUSTOMER_ID'
    );
  }

  const body: CreateInvoicePayload = {
    invoiceNumber: invoice.invoiceNumber,
    customerId: numericCustomerId,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paymentStatus: invoice.paymentStatus,
    notes: invoice.notes,
    anomalyConfirmed,
    items: invoice.items.map((item) => {
      const prodNum = Number(item.productId);
      return {
        productId: Number.isFinite(prodNum) && prodNum > 0 ? prodNum : null,
        productName: item.productName,
        hsnCode: item.hsnCode,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        gstRate: item.gstRate,
      };
    }),
  };

  const raw = await requestJson<Record<string, unknown>>(
    '/invoices',
    { method: 'POST', body: JSON.stringify(body) },
    baseUrl,
    fetchImpl
  );
  return normalizeInvoice(raw);
}

export async function recordPaymentApi(
  invoiceId: string,
  amountPaid: number,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Invoice> {
  const raw = await requestJson<Record<string, unknown>>(
    `/invoices/${encodeURIComponent(invoiceId)}/payment`,
    { method: 'PATCH', body: JSON.stringify({ amountPaid }) },
    baseUrl,
    fetchImpl
  );
  return normalizeInvoice(raw);
}

export async function reviewInvoiceAnomaliesApi(
  invoiceId: string,
  reviewerNote: string,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<Invoice> {
  const raw = await requestJson<Record<string, unknown>>(
    `/invoices/${encodeURIComponent(invoiceId)}/anomalies/review`,
    { method: 'PATCH', body: JSON.stringify({ reviewerNote }) },
    baseUrl,
    fetchImpl
  );
  return normalizeInvoice(raw);
}

export async function appendAuditLogApi(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  baseUrl = getApiBaseUrl(),
  fetchImpl: FetchLike = fetch
): Promise<AuditLogEntry> {
  const raw = await requestJson<Record<string, unknown>>(
    '/audit-logs',
    { method: 'POST', body: JSON.stringify(entry) },
    baseUrl,
    fetchImpl
  );
  return normalizeAuditLog(raw);
}
