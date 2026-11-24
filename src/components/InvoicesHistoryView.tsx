import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  IndianRupee,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Invoice, PaymentStatus, SellerProfile } from '../types/billing.ts';
import { formatINR } from '../utils/gstCalculator.ts';
import { downloadInvoicePdf } from '../utils/pdfExport.ts';

interface InvoicesHistoryViewProps {
  invoices: Invoice[];
  seller: SellerProfile;
  onPreviewInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoiceId: string, amountPaid: number) => void;
  onResolveAnomaly: (invoiceId: string, note: string) => void;
}

type StatusFilter = 'ALL' | PaymentStatus | 'FLAGGED';

export function InvoicesHistoryView({
  invoices,
  seller,
  onPreviewInvoice,
  onRecordPayment,
  onResolveAnomaly,
}: InvoicesHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(
    null
  );
  const [paymentInput, setPaymentInput] = useState('');
  const [anomalyModalInvoice, setAnomalyModalInvoice] = useState<Invoice | null>(
    null
  );
  const [reviewerNote, setReviewerNote] = useState('');

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...invoices]
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
      .filter((inv) => {
        if (statusFilter === 'FLAGGED' && inv.anomalies.length === 0) {
          return false;
        }
        if (
          statusFilter !== 'ALL' &&
          statusFilter !== 'FLAGGED' &&
          inv.paymentStatus !== statusFilter
        ) {
          return false;
        }
        if (!q) return true;
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          (inv.customerGstin ?? '').toLowerCase().includes(q) ||
          inv.customerState.toLowerCase().includes(q)
        );
      });
  }, [invoices, searchQuery, statusFilter]);

  const filterCounts = useMemo(
    () => ({
      ALL: invoices.length,
      PAID: invoices.filter((i) => i.paymentStatus === 'PAID').length,
      PENDING: invoices.filter((i) => i.paymentStatus === 'PENDING').length,
      PARTIAL: invoices.filter((i) => i.paymentStatus === 'PARTIAL').length,
      OVERDUE: invoices.filter((i) => i.paymentStatus === 'OVERDUE').length,
      FLAGGED: invoices.filter((i) => i.anomalies.length > 0).length,
    }),
    [invoices]
  );

  const openPaymentModal = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentInput(String(Math.max(0, inv.grandTotal - inv.amountPaid)));
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    const added = Math.max(0, Number(paymentInput) || 0);
    const totalPaid = Math.min(
      paymentModalInvoice.grandTotal,
      paymentModalInvoice.amountPaid + added
    );
    onRecordPayment(paymentModalInvoice.id, totalPaid);
    setPaymentModalInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Invoices &amp; Payment Ledger
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Search issued tax invoices, record customer settlements, inspect anomaly explanations, and download GST PDFs.
        </p>
      </div>

      {/* Search + Status Tabs */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, customer, GSTIN, or state..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['ALL', 'All Invoices'],
              ['PAID', 'Paid'],
              ['PENDING', 'Pending'],
              ['PARTIAL', 'Partial'],
              ['OVERDUE', 'Overdue'],
              ['FLAGGED', 'Anomaly Flagged'],
            ] as Array<[StatusFilter, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === key
                  ? 'bg-[#0B1F3A] text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {label} ({filterCounts[key]})
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredInvoices.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            No invoices match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice # &amp; Date</th>
                  <th className="px-4 py-3 font-semibold">Customer &amp; Supply</th>
                  <th className="px-4 py-3 text-right font-semibold">Taxable</th>
                  <th className="px-4 py-3 text-right font-semibold">GST</th>
                  <th className="px-4 py-3 text-right font-semibold">Grand Total</th>
                  <th className="px-4 py-3 font-semibold">Status &amp; Risk</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          Issued {inv.issueDate} · Due {inv.dueDate}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {inv.customerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {inv.customerState} ·{' '}
                          {inv.supplyType === 'INTRA_STATE' ? 'CGST+SGST' : 'IGST'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                        {formatINR(inv.taxableAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                        {formatINR(inv.totalTax)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {formatINR(inv.grandTotal)}
                        </div>
                        {balance > 0 && (
                          <div className="font-mono text-[11px] text-amber-700 tabular-nums">
                            Due {formatINR(balance)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`text-xs font-bold ${
                            inv.paymentStatus === 'PAID'
                              ? 'text-emerald-700'
                              : inv.paymentStatus === 'OVERDUE'
                                ? 'text-red-600'
                                : 'text-amber-700'
                          }`}
                        >
                          {inv.paymentStatus}
                        </div>
                        {inv.anomalies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnomalyModalInvoice(inv);
                              setReviewerNote(
                                inv.anomalies[0]?.reviewerNote ?? ''
                              );
                            }}
                            className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${
                              inv.hasUnreviewedAnomalies
                                ? 'text-amber-700 hover:text-amber-900'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>
                              {inv.anomalies.length} Anomaly
                              {inv.hasUnreviewedAnomalies ? ' (Review)' : ' (Reviewed)'}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewInvoice(inv)}
                            title="Preview & Print Invoice"
                            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Preview ${inv.invoiceNumber}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadInvoicePdf(inv, seller)}
                            title="Download PDF"
                            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
                            aria-label={`Download PDF ${inv.invoiceNumber}`}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {inv.paymentStatus !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => openPaymentModal(inv)}
                              className="ml-1 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <IndianRupee className="h-3 w-3" />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Record Payment · {paymentModalInvoice.invoiceNumber}
              </h2>
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmPayment} className="space-y-4 p-5">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 tabular-nums">
                <div className="flex justify-between">
                  <span>Grand Total</span>
                  <span className="font-mono font-semibold">
                    {formatINR(paymentModalInvoice.grandTotal)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Already Paid</span>
                  <span className="font-mono font-semibold">
                    {formatINR(paymentModalInvoice.amountPaid)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
                  <span>Remaining Balance</span>
                  <span className="font-mono">
                    {formatINR(
                      Math.max(
                        0,
                        paymentModalInvoice.grandTotal -
                          paymentModalInvoice.amountPaid
                      )
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Payment Amount Received (INR)
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(
                    1,
                    paymentModalInvoice.grandTotal -
                      paymentModalInvoice.amountPaid
                  )}
                  step="0.01"
                  required
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Anomaly Review Modal */}
      {anomalyModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Anomaly Audit · {anomalyModalInvoice.invoiceNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAnomalyModalInvoice(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-xs text-slate-600">
                Customer: <span className="font-semibold text-slate-900">{anomalyModalInvoice.customerName}</span> · Grand Total{' '}
                <span className="font-mono font-semibold text-slate-900">
                  {formatINR(anomalyModalInvoice.grandTotal)}
                </span>
              </p>

              <div className="space-y-3">
                {anomalyModalInvoice.anomalies.map((flag) => (
                  <div
                    key={flag.id}
                    className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {flag.title}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-amber-800">
                        {flag.severity} · {flag.ruleCode}
                      </span>
                    </div>
                    <p className="mt-1.5 text-slate-700">{flag.explanation}</p>
                    <div className="mt-2 font-mono text-[11px] text-slate-500">
                      Observed: {flag.metricValue} | Expected: {flag.baselineValue}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Accountant Review Note
                </label>
                <input
                  type="text"
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder="e.g. Verified PO #4921 — bulk corporate order approved"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setAnomalyModalInvoice(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResolveAnomaly(
                      anomalyModalInvoice.id,
                      reviewerNote.trim() || 'Reviewed and verified by accountant'
                    );
                    setAnomalyModalInvoice(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark Anomalies Reviewed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
