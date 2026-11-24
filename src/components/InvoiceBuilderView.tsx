import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
  Customer,
  GstRate,
  Invoice,
  InvoiceLineInput,
  PaymentStatus,
  Product,
  SellerProfile,
} from '../types/billing.ts';
import { detectInvoiceAnomalies } from '../utils/anomalyDetector.ts';
import { suggestProductCategorisation } from '../utils/categorizer.ts';
import {
  amountInWordsINR,
  calculateInvoiceTotals,
  formatINR,
} from '../utils/gstCalculator.ts';

interface InvoiceBuilderViewProps {
  seller: SellerProfile;
  customers: Customer[];
  products: Product[];
  existingInvoices: Invoice[];
  onCreateInvoice: (
    invoice: Invoice,
    downloadPdfAfter: boolean,
    anomalyConfirmed: boolean
  ) => void | Promise<void>;
}

const GST_RATES: GstRate[] = [0, 5, 12, 18, 28];

function getNextInvoiceNumber(existingInvoices: Invoice[]): string {
  const maxNum = existingInvoices.reduce((max, inv) => {
    const match = inv.invoiceNumber.match(/(\d+)$/);
    const n = match ? Number(match[1]) : 100;
    return Math.max(max, n);
  }, 100);
  return `BB-2026-${String(maxNum + 1).padStart(4, '0')}`;
}

export function InvoiceBuilderView({
  seller,
  customers,
  products,
  existingInvoices,
  onCreateInvoice,
}: InvoiceBuilderViewProps) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultDue = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    getNextInvoiceNumber(existingInvoices)
  );
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [initialStatus, setInitialStatus] = useState<PaymentStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [anomalyConfirmed, setAnomalyConfirmed] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [lines, setLines] = useState<InvoiceLineInput[]>(() => {
    const first = products[0];
    if (!first) return [];
    return [
      {
        productId: first.id,
        productName: first.name,
        hsnCode: first.hsnCode,
        category: first.category,
        unit: first.unit,
        quantity: 1,
        unitPrice: first.unitPrice,
        discountPercent: 0,
        gstRate: first.gstRate,
      },
    ];
  });

  useEffect(() => {
    if (customers.length > 0 && !customers.some((c) => c.id === customerId)) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  useEffect(() => {
    if (lines.length === 0 && products.length > 0) {
      const first = products[0];
      setLines([
        {
          productId: first.id,
          productName: first.name,
          hsnCode: first.hsnCode,
          category: first.category,
          unit: first.unit,
          quantity: 1,
          unitPrice: first.unitPrice,
          discountPercent: 0,
          gstRate: first.gstRate,
        },
      ]);
    }
  }, [products, lines.length]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? customers[0],
    [customers, customerId]
  );

  const totals = useMemo(() => {
    const custState = selectedCustomer?.state ?? seller.state;
    return calculateInvoiceTotals(lines, seller.state, custState);
  }, [lines, seller.state, selectedCustomer]);

  const detectedAnomalies = useMemo(() => {
    if (!selectedCustomer || lines.length === 0) return [];
    return detectInvoiceAnomalies(
      {
        issueDate,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.businessName || selectedCustomer.name,
        items: totals.items,
        grandTotal: totals.grandTotal,
      },
      existingInvoices,
      products
    );
  }, [
    selectedCustomer,
    lines.length,
    issueDate,
    totals.items,
    totals.grandTotal,
    existingInvoices,
    products,
  ]);

  const handleSelectProduct = (lineIdx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setLines((prev) =>
      prev.map((line, idx) =>
        idx === lineIdx
          ? {
              ...line,
              productId: prod.id,
              productName: prod.name,
              hsnCode: prod.hsnCode,
              category: prod.category,
              unit: prod.unit,
              unitPrice: prod.unitPrice,
              gstRate: prod.gstRate,
            }
          : line
      )
    );
    setAnomalyConfirmed(false);
  };

  const handleUpdateLine = <K extends keyof InvoiceLineInput>(
    lineIdx: number,
    field: K,
    value: InvoiceLineInput[K]
  ) => {
    setLines((prev) =>
      prev.map((line, idx) =>
        idx === lineIdx ? { ...line, [field]: value } : line
      )
    );
    setAnomalyConfirmed(false);
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    const fallback = products[lines.length % products.length] ?? products[0];
    if (!fallback) return;
    setLines((prev) => [
      ...prev,
      {
        productId: fallback.id,
        productName: fallback.name,
        hsnCode: fallback.hsnCode,
        category: fallback.category,
        unit: fallback.unit,
        quantity: 1,
        unitPrice: fallback.unitPrice,
        discountPercent: 0,
        gstRate: fallback.gstRate,
      },
    ]);
  };

  const handleAutoCategoriseLine = (lineIdx: number) => {
    const target = lines[lineIdx];
    if (!target) return;
    const sug = suggestProductCategorisation(target.productName);
    setLines((prev) =>
      prev.map((line, idx) =>
        idx === lineIdx
          ? {
              ...line,
              category: sug.category,
              hsnCode: sug.hsnCode,
              gstRate: sug.suggestedGstRate,
            }
          : line
      )
    );
  };

  const handleRemoveLine = (lineIdx: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, idx) => idx !== lineIdx));
  };

  const handleSave = async (downloadPdfAfter: boolean) => {
    setValidationError('');
    if (!selectedCustomer) {
      setValidationError('Please select a customer before issuing an invoice.');
      return;
    }
    if (lines.length === 0 || lines.some((l) => l.quantity <= 0)) {
      setValidationError('Each line item must have a quantity greater than 0.');
      return;
    }
    if (detectedAnomalies.length > 0 && !anomalyConfirmed) {
      setValidationError(
        'Please review the detected invoice anomalies and check the confirmation box before saving.'
      );
      return;
    }

    const reviewedAnomalies = detectedAnomalies.map((flag) => ({
      ...flag,
      reviewed: anomalyConfirmed,
      reviewerNote: anomalyConfirmed
        ? 'Confirmed by accountant during invoice issuance'
        : undefined,
    }));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || getNextInvoiceNumber(existingInvoices),
      issueDate,
      dueDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.businessName || selectedCustomer.name,
      customerGstin: selectedCustomer.gstin,
      customerState: selectedCustomer.state,
      customerAddress: `${selectedCustomer.address}, ${selectedCustomer.city} - ${selectedCustomer.pincode}`,
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
      amountPaid: initialStatus === 'PAID' ? totals.grandTotal : 0,
      paymentStatus: initialStatus,
      notes: notes.trim() || undefined,
      anomalies: reviewedAnomalies,
      hasUnreviewedAnomalies: reviewedAnomalies.some((a) => !a.reviewed),
      createdAt: new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      await onCreateInvoice(newInvoice, downloadPdfAfter, anomalyConfirmed);
    } catch (err) {
      setValidationError(
        err instanceof Error
          ? err.message
          : 'Failed to save invoice to Spring Boot backend.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create GST Tax Invoice
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Deterministic CGST/SGST and IGST engine with real-time anomaly screening. Final tax figures are strictly rule-computed.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            {totals.supplyType === 'INTRA_STATE'
              ? `Intra-State (${seller.state}) -> CGST + SGST`
              : `Inter-State (${seller.state} -> ${selectedCustomer?.state ?? ''}) -> IGST`}
          </span>
        </div>
      </div>

      {validationError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {validationError}
        </div>
      )}

      {/* Invoice Header Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700">
            Customer Account *
          </label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setAnomalyConfirmed(false);
            }}
            aria-label="Select Customer"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName || c.name} — {c.state}
                {c.gstin ? ` (${c.gstin})` : ' (B2C)'}
              </option>
            ))}
          </select>
          {selectedCustomer && (
            <p className="mt-1.5 text-xs text-slate-500">
              {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Invoice Number
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Issue Date
          </label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Due Date &amp; Payment Status
          </label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-2 font-mono text-xs outline-none focus:border-emerald-600"
            />
            <select
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value as PaymentStatus)}
              aria-label="Initial payment status"
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-base font-semibold text-slate-900">
            Line Items ({lines.length})
          </h2>
          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#122D52]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Line Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Product / Item</th>
                <th className="px-3 py-2.5 font-semibold">HSN</th>
                <th className="w-20 px-3 py-2.5 text-right font-semibold">Qty</th>
                <th className="w-28 px-3 py-2.5 text-right font-semibold">Rate (₹)</th>
                <th className="w-20 px-3 py-2.5 text-right font-semibold">Disc %</th>
                <th className="w-24 px-3 py-2.5 text-right font-semibold">GST %</th>
                <th className="px-3 py-2.5 text-right font-semibold">Taxable</th>
                <th className="px-4 py-2.5 text-right font-semibold">Line Total</th>
                <th className="w-12 px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line, idx) => {
                const calc = totals.items[idx];
                return (
                  <tr key={idx} className="align-top">
                    <td className="px-4 py-3">
                      <select
                        value={line.productId}
                        onChange={(e) => handleSelectProduct(idx, e.target.value)}
                        aria-label={`Product for line ${idx + 1}`}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatINR(p.unitPrice)})
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{line.category}</span>
                        <button
                          type="button"
                          onClick={() => handleAutoCategoriseLine(idx)}
                          className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Verify HSN</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={line.hsnCode}
                        onChange={(e) =>
                          handleUpdateLine(idx, 'hsnCode', e.target.value)
                        }
                        aria-label={`HSN code line ${idx + 1}`}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs outline-none focus:border-emerald-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateLine(
                            idx,
                            'quantity',
                            Math.max(1, Number(e.target.value) || 0)
                          )
                        }
                        aria-label={`Quantity line ${idx + 1}`}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right font-mono text-xs outline-none focus:border-emerald-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          handleUpdateLine(
                            idx,
                            'unitPrice',
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                        aria-label={`Unit price line ${idx + 1}`}
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right font-mono text-xs outline-none focus:border-emerald-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={line.discountPercent}
                        onChange={(e) =>
                          handleUpdateLine(
                            idx,
                            'discountPercent',
                            Math.min(100, Math.max(0, Number(e.target.value) || 0))
                          )
                        }
                        aria-label={`Discount percent line ${idx + 1}`}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right font-mono text-xs outline-none focus:border-emerald-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={line.gstRate}
                        onChange={(e) =>
                          handleUpdateLine(
                            idx,
                            'gstRate',
                            Number(e.target.value) as GstRate
                          )
                        }
                        aria-label={`GST rate line ${idx + 1}`}
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs outline-none focus:border-emerald-600"
                      >
                        {GST_RATES.map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {calc ? formatINR(calc.taxableValue) : '₹0.00'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {calc ? formatINR(calc.lineTotal) : '₹0.00'}
                      {calc && (
                        <div className="mt-0.5 text-[10px] font-normal text-slate-500">
                          {totals.supplyType === 'INTRA_STATE'
                            ? `C ${calc.cgstRate}% + S ${calc.sgstRate}%`
                            : `IGST ${calc.igstRate}%`}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length <= 1}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                        aria-label={`Remove line ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Alert Panel + Totals Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Anomaly Screening Status */}
          {detectedAnomalies.length > 0 ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-950">
                    {detectedAnomalies.length} Billing Anomaly Alert
                    {detectedAnomalies.length > 1 ? 's' : ''} Detected
                  </h3>
                  <p className="mt-0.5 text-xs text-amber-900">
                    BillBook never alters invoice amounts automatically. Review each explanation below before confirming.
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {detectedAnomalies.map((flag) => (
                      <div
                        key={flag.id}
                        className="rounded-lg border border-amber-200 bg-white p-3 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">
                            {flag.title}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-amber-800">
                            {flag.severity} · {flag.ruleCode}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600">{flag.explanation}</p>
                        <div className="mt-1.5 font-mono text-[11px] text-slate-500">
                          Observed: {flag.metricValue} · Baseline: {flag.baselineValue}
                        </div>
                      </div>
                    ))}
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={anomalyConfirmed}
                      onChange={(e) => setAnomalyConfirmed(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                    />
                    <span>
                      I have reviewed these flagged anomalies and confirm invoice amounts &amp; GST rates are intentional.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <div className="font-semibold">
                  Anomaly Screening Passed
                </div>
                <div className="text-xs text-emerald-800">
                  Discounts, quantities, HSN-GST slabs, and invoice totals fall within normal historical tolerances.
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <label className="block text-xs font-semibold text-slate-700">
              Invoice Notes / Dispatch Reference
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional delivery instructions, PO reference, or payment terms..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
            <div className="mt-3 text-xs text-slate-500">
              Amount in Words:{' '}
              <span className="font-semibold text-slate-800">
                {amountInWordsINR(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Deterministic Tax Summary Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900">
            Tax &amp; Total Summary
          </h3>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Gross Subtotal</dt>
              <dd className="font-mono font-medium text-slate-900 tabular-nums">
                {formatINR(totals.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Total Discount</dt>
              <dd className="font-mono font-medium text-red-600 tabular-nums">
                - {formatINR(totals.totalDiscount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="font-medium text-slate-700">Taxable Value</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatINR(totals.taxableAmount)}
              </dd>
            </div>

            {totals.supplyType === 'INTRA_STATE' ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-600">CGST (Intra-State)</dt>
                  <dd className="font-mono text-slate-800 tabular-nums">
                    {formatINR(totals.cgstTotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">SGST (Intra-State)</dt>
                  <dd className="font-mono text-slate-800 tabular-nums">
                    {formatINR(totals.sgstTotal)}
                  </dd>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <dt className="text-slate-600">IGST (Inter-State)</dt>
                <dd className="font-mono text-slate-800 tabular-nums">
                  {formatINR(totals.igstTotal)}
                </dd>
              </div>
            )}

            <div className="flex justify-between">
              <dt className="text-slate-600">Round Off</dt>
              <dd className="font-mono text-slate-700 tabular-nums">
                {totals.roundOff >= 0 ? '+' : ''}
                {totals.roundOff.toFixed(2)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <dt className="text-base font-bold text-[#0B1F3A]">Grand Total</dt>
              <dd className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                {formatINR(totals.grandTotal)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Issuing Invoice...' : 'Save & Issue Invoice'}</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#122D52] disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Save &amp; Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
