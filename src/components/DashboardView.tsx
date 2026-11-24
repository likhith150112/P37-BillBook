import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  ReceiptIndianRupee,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Invoice, NavSection } from '../types/billing.ts';
import {
  formatINR,
  formatINRCompact,
  round2,
} from '../utils/gstCalculator.ts';

interface DashboardViewProps {
  invoices: Invoice[];
  onNavigate: (section: NavSection) => void;
  onInspectInvoice: (invoice: Invoice) => void;
  onMarkPaid: (invoiceId: string) => void;
}

export function DashboardView({
  invoices,
  onNavigate,
  onInspectInvoice,
  onMarkPaid,
}: DashboardViewProps) {
  const [chartMetric, setChartMetric] = useState<'revenue' | 'tax'>('revenue');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const totalRevenue = round2(
      invoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
    );
    const totalPaid = round2(
      invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    );
    const pendingAmount = round2(
      invoices.reduce(
        (sum, inv) => sum + Math.max(0, inv.grandTotal - inv.amountPaid),
        0
      )
    );
    const gstCollected = round2(
      invoices.reduce((sum, inv) => sum + inv.totalTax, 0)
    );
    const cgstSgst = round2(
      invoices.reduce((sum, inv) => sum + inv.cgstTotal + inv.sgstTotal, 0)
    );
    const igst = round2(invoices.reduce((sum, inv) => sum + inv.igstTotal, 0));
    const paidCount = invoices.filter((i) => i.paymentStatus === 'PAID').length;
    const overdueCount = invoices.filter(
      (i) => i.paymentStatus === 'OVERDUE'
    ).length;
    const flaggedInvoices = invoices.filter((i) => i.anomalies.length > 0);

    return {
      totalRevenue,
      totalPaid,
      pendingAmount,
      gstCollected,
      cgstSgst,
      igst,
      paidCount,
      overdueCount,
      flaggedInvoices,
    };
  }, [invoices]);

  const monthlySeries = useMemo(() => {
    const map = new Map<
      string,
      {
        monthKey: string;
        label: string;
        revenue: number;
        taxable: number;
        gst: number;
        count: number;
      }
    >();

    for (const inv of invoices) {
      const monthKey = inv.issueDate.slice(0, 7);
      const date = new Date(`${monthKey}-01T00:00:00`);
      const label = date.toLocaleDateString('en-IN', {
        month: 'short',
        year: '2-digit',
      });
      const existing = map.get(monthKey);
      if (existing) {
        existing.revenue = round2(existing.revenue + inv.grandTotal);
        existing.taxable = round2(existing.taxable + inv.taxableAmount);
        existing.gst = round2(existing.gst + inv.totalTax);
        existing.count += 1;
      } else {
        map.set(monthKey, {
          monthKey,
          label,
          revenue: inv.grandTotal,
          taxable: inv.taxableAmount,
          gst: inv.totalTax,
          count: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey)
    );
  }, [invoices]);

  const slabBreakdown = useMemo(() => {
    const map = new Map<number, { rate: number; taxable: number; tax: number }>();
    for (const rate of [0, 5, 12, 18, 28]) {
      map.set(rate, { rate, taxable: 0, tax: 0 });
    }
    for (const inv of invoices) {
      for (const item of inv.items) {
        const entry = map.get(item.gstRate);
        if (entry) {
          entry.taxable = round2(entry.taxable + item.taxableValue);
          entry.tax = round2(entry.tax + item.totalTax);
        }
      }
    }
    const rows = Array.from(map.values()).filter((r) => r.taxable > 0 || r.tax > 0);
    const maxTaxable = Math.max(1, ...rows.map((r) => r.taxable));
    return { rows, maxTaxable };
  }, [invoices]);

  const maxMonthlyVal = Math.max(
    1,
    ...monthlySeries.map((m) => (chartMetric === 'revenue' ? m.revenue : m.gst))
  );

  const activeHoverData =
    monthlySeries.find((m) => m.monthKey === hoveredMonth) ??
    monthlySeries[monthlySeries.length - 1];

  const recentInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
        .slice(0, 5),
    [invoices]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Deterministic GST billing performance, receivables, and anomaly screening across synthetic SME records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('reports')}
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:self-auto"
        >
          <span>Open GSTR-1 &amp; Sales Reports</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Total Billed Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatINRCompact(kpis.totalRevenue)}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            Collected {formatINR(kpis.totalPaid)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Invoices Issued</span>
            <FileText className="h-4 w-4 text-[#0B1F3A]" />
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {invoices.length}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            {kpis.paidCount} paid · {invoices.length - kpis.paidCount} open
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Total GST Collected</span>
            <ReceiptIndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
            {formatINRCompact(kpis.gstCollected)}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            CGST+SGST {formatINRCompact(kpis.cgstSgst)} · IGST {formatINRCompact(kpis.igst)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Pending Receivables</span>
            <Clock3 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatINRCompact(kpis.pendingAmount)}
          </div>
          <div className="mt-1.5 text-xs text-slate-600 tabular-nums">
            {kpis.overdueCount} overdue · {kpis.flaggedInvoices.length} anomaly flagged
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Monthly Sales &amp; GST Trend
              </h2>
              {activeHoverData && (
                <p className="mt-0.5 text-xs text-slate-600 tabular-nums">
                  {activeHoverData.label}: Revenue {formatINR(activeHoverData.revenue)} · GST{' '}
                  {formatINR(activeHoverData.gst)} ({activeHoverData.count} invoices)
                </p>
              )}
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  chartMetric === 'revenue'
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gross Revenue
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('tax')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  chartMetric === 'tax'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                GST Collected
              </button>
            </div>
          </div>

          <div className="mt-6">
            {monthlySeries.length === 0 ? (
              <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 text-sm text-slate-500">
                No billed invoices available to plot monthly revenue and GST trends.
              </div>
            ) : (
            <svg
              viewBox="0 0 640 220"
              className="h-56 w-full overflow-visible"
              role="img"
              aria-label="Monthly revenue and GST collected bar chart"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const y = 185 - tick * 155;
                const val = maxMonthlyVal * tick;
                return (
                  <g key={tick}>
                    <line
                      x1="64"
                      x2="625"
                      y1={y}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={tick === 0 ? undefined : '3 3'}
                    />
                    <text
                      x="56"
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[10px]"
                    >
                      {formatINRCompact(val)}
                    </text>
                  </g>
                );
              })}

              {monthlySeries.map((m, idx) => {
                const plotWidth = 540;
                const slot = plotWidth / Math.max(1, monthlySeries.length);
                const barWidth = Math.min(46, slot * 0.52);
                const x = 74 + idx * slot + (slot - barWidth) / 2;
                const value = chartMetric === 'revenue' ? m.revenue : m.gst;
                const barHeight = Math.max(4, (value / maxMonthlyVal) * 155);
                const y = 185 - barHeight;
                const isHovered = hoveredMonth === m.monthKey;

                return (
                  <g
                    key={m.monthKey}
                    onMouseEnter={() => setHoveredMonth(m.monthKey)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="5"
                      fill={
                        chartMetric === 'revenue'
                          ? isHovered
                            ? '#059669'
                            : '#0B1F3A'
                          : isHovered
                            ? '#0B1F3A'
                            : '#059669'
                      }
                    />
                    <text
                      x={x + barWidth / 2}
                      y="206"
                      textAnchor="middle"
                      className="fill-slate-600 text-[11px] font-medium"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            )}
          </div>
        </div>

        {/* GST Slab Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Taxable Volume by GST Slab
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Deterministic slab breakdown across billed line items
          </p>

          <div className="mt-5 space-y-4">
            {slabBreakdown.rows.map((row) => {
              const pct = Math.round((row.taxable / slabBreakdown.maxTaxable) * 100);
              return (
                <div key={row.rate}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {row.rate}% GST Slab
                    </span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {formatINRCompact(row.taxable)} · Tax {formatINRCompact(row.tax)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom 2-column action area */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Anomaly Review Queue */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Anomaly Detection Alerts
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Review All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {kpis.flaggedInvoices.length === 0 ? (
              <div className="flex items-center gap-3 p-5 text-sm text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>No unverified billing anomalies detected.</span>
              </div>
            ) : (
              kpis.flaggedInvoices.slice(0, 4).map((inv) => {
                const topAlert = inv.anomalies[0];
                return (
                  <div
                    key={inv.id}
                    className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <span className="font-mono">{inv.invoiceNumber}</span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate">{inv.customerName}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {topAlert.title} — {topAlert.explanation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onInspectInvoice(inv)}
                      className="shrink-0 self-start rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
                    >
                      Inspect
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Invoices
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Invoice</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="max-w-[130px] truncate px-3 py-2.5 text-xs text-slate-700">
                      {inv.customerName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span
                        className={`text-xs font-semibold ${
                          inv.paymentStatus === 'PAID'
                            ? 'text-emerald-700'
                            : inv.paymentStatus === 'OVERDUE'
                              ? 'text-red-600'
                              : 'text-amber-700'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      {inv.paymentStatus !== 'PAID' ? (
                        <button
                          type="button"
                          onClick={() => onMarkPaid(inv.id)}
                          className="whitespace-nowrap text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onInspectInvoice(inv)}
                          className="whitespace-nowrap text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          View PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
