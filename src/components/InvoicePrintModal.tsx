import { Download, Printer, X } from 'lucide-react';
import type { Invoice, SellerProfile } from '../types/billing.ts';
import { amountInWordsINR, formatINR } from '../utils/gstCalculator.ts';
import { downloadInvoicePdf } from '../utils/pdfExport.ts';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  seller: SellerProfile;
  onClose: () => void;
}

export function InvoicePrintModal({
  invoice,
  seller,
  onClose,
}: InvoicePrintModalProps) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
      <div className="print-only-container my-auto w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Modal Toolbar (hidden during print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="text-sm font-semibold text-slate-900">
            Tax Invoice Preview · <span className="font-mono">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => downloadInvoicePdf(invoice, seller)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
              aria-label="Close invoice preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Invoice Document */}
        <div className="max-h-[82vh] overflow-y-auto p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b-2 border-[#0B1F3A] pb-5 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-xl font-bold text-[#0B1F3A]">
                {seller.businessName}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                {seller.address}, {seller.city} - {seller.pincode}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                GSTIN: <span className="font-mono font-semibold text-slate-900">{seller.gstin}</span> · State: {seller.state} ({seller.stateCode})
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                {seller.phone} · {seller.email}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-lg font-bold tracking-wider text-[#0B1F3A]">
                TAX INVOICE
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
                #{invoice.invoiceNumber}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Status:{' '}
                <span className="font-bold text-emerald-700">
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer & Dates */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Bill To
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {invoice.customerName}
              </div>
              <div className="mt-0.5 font-mono text-xs text-slate-700">
                {invoice.customerGstin
                  ? `GSTIN: ${invoice.customerGstin}`
                  : 'GSTIN: Unregistered (B2C)'}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {invoice.customerAddress}, {invoice.customerState}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Invoice Metadata
              </div>
              <dl className="mt-1.5 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Issue Date:</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {invoice.issueDate}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Due Date:</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {invoice.dueDate}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Place of Supply:</dt>
                  <dd className="font-semibold text-slate-900">
                    {invoice.customerState} (
                    {invoice.supplyType === 'INTRA_STATE'
                      ? 'CGST + SGST'
                      : 'IGST'}
                    )
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-y border-slate-300 bg-slate-100 text-[11px] uppercase text-slate-700">
                  <th className="px-2.5 py-2 font-semibold">#</th>
                  <th className="px-2.5 py-2 font-semibold">Description &amp; HSN</th>
                  <th className="px-2.5 py-2 text-right font-semibold">Qty</th>
                  <th className="px-2.5 py-2 text-right font-semibold">Rate</th>
                  <th className="px-2.5 py-2 text-right font-semibold">Disc</th>
                  <th className="px-2.5 py-2 text-right font-semibold">Taxable</th>
                  <th className="px-2.5 py-2 text-right font-semibold">GST</th>
                  <th className="px-2.5 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-2.5 py-2.5 font-mono">{idx + 1}</td>
                    <td className="px-2.5 py-2.5">
                      <div className="font-semibold text-slate-900">
                        {item.productName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        HSN: {item.hsnCode} · {item.category}
                      </div>
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono tabular-nums">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono tabular-nums">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono tabular-nums">
                      {item.discountPercent}%
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono tabular-nums">
                      {formatINR(item.taxableValue)}
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono tabular-nums">
                      {item.gstRate}% ({formatINR(item.totalTax)})
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatINR(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary & Bank Info */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="font-semibold text-slate-700">
                  Amount in Words
                </div>
                <div className="mt-1 font-medium text-slate-900">
                  {amountInWordsINR(invoice.grandTotal)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="font-semibold text-slate-700">
                  Bank Details for Settlement
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-600">
                  {seller.bankName} · A/C {seller.accountNumber} · IFSC {seller.ifscCode}
                </div>
              </div>
              {invoice.notes && (
                <div className="text-slate-600">
                  <span className="font-semibold">Notes:</span> {invoice.notes}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 text-xs">
              <dl className="space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Gross Subtotal</dt>
                  <dd className="font-mono tabular-nums">
                    {formatINR(invoice.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Discount</dt>
                  <dd className="font-mono tabular-nums">
                    - {formatINR(invoice.totalDiscount)}
                  </dd>
                </div>
                <div className="flex justify-between font-semibold text-slate-800">
                  <dt>Taxable Value</dt>
                  <dd className="font-mono tabular-nums">
                    {formatINR(invoice.taxableAmount)}
                  </dd>
                </div>
                {invoice.supplyType === 'INTRA_STATE' ? (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">CGST</dt>
                      <dd className="font-mono tabular-nums">
                        {formatINR(invoice.cgstTotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">SGST</dt>
                      <dd className="font-mono tabular-nums">
                        {formatINR(invoice.sgstTotal)}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <dt className="text-slate-600">IGST</dt>
                    <dd className="font-mono tabular-nums">
                      {formatINR(invoice.igstTotal)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-600">Round Off</dt>
                  <dd className="font-mono tabular-nums">
                    {invoice.roundOff.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-[#0B1F3A]">
                  <dt>Grand Total</dt>
                  <dd className="font-mono text-emerald-700 tabular-nums">
                    {formatINR(invoice.grandTotal)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1 text-[11px] text-slate-500">
                  <dt>Amount Paid</dt>
                  <dd className="font-mono tabular-nums">
                    {formatINR(invoice.amountPaid)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
