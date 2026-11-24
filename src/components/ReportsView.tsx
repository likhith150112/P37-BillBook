import { Download, FileSpreadsheet } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Invoice } from '../types/billing.ts';
import {
  aggregateHsnSummary,
  formatINR,
  round2,
} from '../utils/gstCalculator.ts';
import { exportCsvFile } from '../utils/pdfExport.ts';

interface ReportsViewProps {
  invoices: Invoice[];
}

export function ReportsView({ invoices }: ReportsViewProps) {
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const scopedInvoices = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.issueDate >= fromDate && inv.issueDate <= toDate
      ),
    [invoices, fromDate, toDate]
  );

  const gstSummary = useMemo(() => {
    const b2b = scopedInvoices.filter((i) => Boolean(i.customerGstin));
    const b2c = scopedInvoices.filter((i) => !i.customerGstin);

    const taxableTotal = round2(
      scopedInvoices.reduce((s, i) => s + i.taxableAmount, 0)
    );
    const cgstTotal = round2(
      scopedInvoices.reduce((s, i) => s + i.cgstTotal, 0)
    );
    const sgstTotal = round2(
      scopedInvoices.reduce((s, i) => s + i.sgstTotal, 0)
    );
    const igstTotal = round2(
      scopedInvoices.reduce((s, i) => s + i.igstTotal, 0)
    );
    const totalTax = round2(cgstTotal + sgstTotal + igstTotal);
    const grandTotal = round2(
      scopedInvoices.reduce((s, i) => s + i.grandTotal, 0)
    );

    return {
      b2bCount: b2b.length,
      b2bValue: round2(b2b.reduce((s, i) => s + i.grandTotal, 0)),
      b2cCount: b2c.length,
      b2cValue: round2(b2c.reduce((s, i) => s + i.grandTotal, 0)),
      taxableTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      grandTotal,
    };
  }, [scopedInvoices]);

  const hsnRows = useMemo(
    () => aggregateHsnSummary(scopedInvoices),
    [scopedInvoices]
  );

  const customerSales = useMemo(() => {
    const map = new Map<
      string,
      {
        customerName: string;
        gstin: string;
        state: string;
        invoiceCount: number;
        taxable: number;
        tax: number;
        total: number;
      }
    >();

    for (const inv of scopedInvoices) {
      const prev = map.get(inv.customerId);
      if (prev) {
        prev.invoiceCount += 1;
        prev.taxable = round2(prev.taxable + inv.taxableAmount);
        prev.tax = round2(prev.tax + inv.totalTax);
        prev.total = round2(prev.total + inv.grandTotal);
      } else {
        map.set(inv.customerId, {
          customerName: inv.customerName,
          gstin: inv.customerGstin || 'B2C Unregistered',
          state: inv.customerState,
          invoiceCount: 1,
          taxable: inv.taxableAmount,
          tax: inv.totalTax,
          total: inv.grandTotal,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [scopedInvoices]);

  const handleExportSalesCsv = () => {
    exportCsvFile(
      `billbook-sales-register-${fromDate}-to-${toDate}.csv`,
      [
        'Invoice Number',
        'Issue Date',
        'Customer Name',
        'Customer GSTIN',
        'State',
        'Supply Type',
        'Taxable Value',
        'CGST',
        'SGST',
        'IGST',
        'Total Tax',
        'Grand Total',
        'Payment Status',
      ],
      scopedInvoices.map((inv) => [
        inv.invoiceNumber,
        inv.issueDate,
        inv.customerName,
        inv.customerGstin ?? 'Unregistered',
        inv.customerState,
        inv.supplyType,
        inv.taxableAmount.toFixed(2),
        inv.cgstTotal.toFixed(2),
        inv.sgstTotal.toFixed(2),
        inv.igstTotal.toFixed(2),
        inv.totalTax.toFixed(2),
        inv.grandTotal.toFixed(2),
        inv.paymentStatus,
      ])
    );
  };

  const handleExportHsnCsv = () => {
    exportCsvFile(
      `billbook-gstr1-hsn-summary-${fromDate}-to-${toDate}.csv`,
      [
        'HSN Code',
        'GST Rate %',
        'Total Quantity',
        'Taxable Value',
        'CGST',
        'SGST',
        'IGST',
        'Total Tax',
      ],
      hsnRows.map((row) => [
        row.hsnCode,
        row.gstRate,
        row.quantity,
        row.taxableValue.toFixed(2),
        row.cgstAmount.toFixed(2),
        row.sgstAmount.toFixed(2),
        row.igstAmount.toFixed(2),
        row.totalTax.toFixed(2),
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales &amp; GSTR-1 Tax Reports
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Filing-ready CGST, SGST, IGST liability breakdown, HSN-wise aggregation, and CSV ledger exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportSalesCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Sales CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportHsnCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export HSN GSTR-1 CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-emerald-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-emerald-600"
          />
        </div>
        <div className="ml-auto text-xs text-slate-500 tabular-nums">
          Showing {scopedInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {/* GST Liability Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Taxable Turnover
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatINR(gstSummary.taxableTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            Grand Billed {formatINR(gstSummary.grandTotal)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            CGST + SGST (Intra-State)
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-emerald-700 tabular-nums">
            {formatINR(gstSummary.cgstTotal + gstSummary.sgstTotal)}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            CGST {formatINR(gstSummary.cgstTotal)} · SGST {formatINR(gstSummary.sgstTotal)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            IGST (Inter-State)
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-[#0B1F3A] tabular-nums">
            {formatINR(gstSummary.igstTotal)}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Total GST Liability {formatINR(gstSummary.totalTax)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            GSTR-1 B2B vs B2C
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {gstSummary.b2bCount} B2B · {gstSummary.b2cCount} B2C
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            B2B {formatINR(gstSummary.b2bValue)}
          </div>
        </div>
      </div>

      {/* HSN-wise GSTR-1 Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            HSN-Wise GST Summary (GSTR-1 Table 12 Format)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">HSN / SAC</th>
                <th className="px-4 py-3 text-right font-semibold">GST Rate</th>
                <th className="px-4 py-3 text-right font-semibold">Total Qty</th>
                <th className="px-4 py-3 text-right font-semibold">Taxable Value</th>
                <th className="px-4 py-3 text-right font-semibold">CGST</th>
                <th className="px-4 py-3 text-right font-semibold">SGST</th>
                <th className="px-4 py-3 text-right font-semibold">IGST</th>
                <th className="px-4 py-3 text-right font-semibold">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hsnRows.map((row) => (
                <tr
                  key={`${row.hsnCode}-${row.gstRate}`}
                  className="hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                    {row.hsnCode}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                    {row.gstRate}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                    {row.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formatINR(row.taxableValue)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                    {formatINR(row.cgstAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                    {formatINR(row.sgstAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                    {formatINR(row.igstAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-700 tabular-nums">
                    {formatINR(row.totalTax)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Sales Breakdown */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Sales by Customer Account
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">GSTIN</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 text-right font-semibold">Invoices</th>
                <th className="px-4 py-3 text-right font-semibold">Taxable</th>
                <th className="px-4 py-3 text-right font-semibold">GST</th>
                <th className="px-4 py-3 text-right font-semibold">Billed Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerSales.map((row) => (
                <tr key={row.customerName} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {row.customerName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {row.gstin}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    {row.state}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">
                    {row.invoiceCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">
                    {formatINR(row.taxable)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">
                    {formatINR(row.tax)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {formatINR(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
