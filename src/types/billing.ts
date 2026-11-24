export type GstRate = 0 | 5 | 12 | 18 | 28;

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaxSupplyType = 'INTRA_STATE' | 'INTER_STATE';

export interface SellerProfile {
  businessName: string;
  gstin: string;
  state: string;
  stateCode: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName?: string;
  gstin?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  hsnCode: string;
  category: string;
  unitPrice: number;
  gstRate: GstRate;
  unit: string;
  stockQty: number;
  autoCategorised?: boolean;
  categorisationRule?: string;
}

export interface InvoiceLineInput {
  productId: string;
  productName: string;
  hsnCode: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstRate: GstRate;
}

export interface CalculatedLineItem extends InvoiceLineInput {
  id: string;
  grossAmount: number;
  discountAmount: number;
  taxableValue: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  lineTotal: number;
}

export interface AnomalyFlag {
  id: string;
  ruleCode: string;
  severity: AnomalySeverity;
  title: string;
  explanation: string;
  metricValue: string;
  baselineValue: string;
  reviewed: boolean;
  reviewerNote?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerState: string;
  customerAddress: string;
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
  amountPaid: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  anomalies: AnomalyFlag[];
  hasUnreviewedAnomalies: boolean;
  injectedAnomalyGroundTruth?: boolean;
  createdAt: string;
}

export interface CategorySuggestion {
  category: string;
  hsnCode: string;
  suggestedGstRate: GstRate;
  confidence: number;
  matchedKeywords: string[];
  explanation: string;
  advisoryOnly: true;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action:
    | 'INVOICE_CREATED'
    | 'PAYMENT_RECORDED'
    | 'ANOMALY_REVIEWED'
    | 'PRODUCT_CATEGORISED'
    | 'CUSTOMER_UPDATED'
    | 'GST_BENCHMARK_RUN';
  entityRef: string;
  actor: string;
  details: string;
}

export type NavSection =
  | 'dashboard'
  | 'create-invoice'
  | 'invoices'
  | 'customers'
  | 'products'
  | 'reports'
  | 'monitoring';

export type AppMode = 'preview' | 'production';

export type BackendConnectionStatus = 'idle' | 'loading' | 'connected' | 'error';

export interface BackendConnectionState {
  status: BackendConnectionStatus;
  error: string | null;
  lastSyncedAt: string | null;
  apiBaseUrl: string;
}

