import {
  CheckCircle2,
  Database,
  Play,
  Server,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  AppMode,
  AuditLogEntry,
  BackendConnectionState,
  Customer,
  Invoice,
  Product,
} from '../types/billing.ts';
import { evaluateAnomalyDetectionRecall } from '../utils/anomalyDetector.ts';
import {
  type GstBenchmarkResult,
  runGst50CaseVerification,
} from '../utils/gstCalculator.ts';

interface MonitoringViewProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  auditLogs: AuditLogEntry[];
  mode: AppMode;
  backendState: BackendConnectionState;
  onBenchmarkExecuted: (result: GstBenchmarkResult) => void;
}

export function MonitoringView({
  invoices,
  customers,
  products,
  auditLogs,
  mode,
  backendState,
  onBenchmarkExecuted,
}: MonitoringViewProps) {
  const [gstBenchmark, setGstBenchmark] = useState<GstBenchmarkResult>(() =>
    runGst50CaseVerification()
  );

  const anomalyMetrics = useMemo(
    () => evaluateAnomalyDetectionRecall(invoices),
    [invoices]
  );

  const totalLineItems = useMemo(
    () => invoices.reduce((sum, inv) => sum + inv.items.length, 0),
    [invoices]
  );

  const handleRunBenchmark = () => {
    const res = runGst50CaseVerification();
    setGstBenchmark(res);
    onBenchmarkExecuted(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monitoring &amp; Quality Assurance
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Live verification of deterministic GST calculations, anomaly detection recall, catalog/invoice counts, and Spring Boot + MySQL deployment architecture.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunBenchmark}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#122D52] sm:self-auto"
        >
          <Play className="h-3.5 w-3.5 text-emerald-400" />
          <span>Run 50-Invoice GST Verification</span>
        </button>
      </div>

      {/* Core Verification Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>GST Accuracy (50 Cases)</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {gstBenchmark.accuracyPercent}%
          </div>
          <div className="mt-1 text-xs text-slate-600 tabular-nums">
            {gstBenchmark.passedCases} / {gstBenchmark.totalCases} deterministic assertions passed
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Anomaly Recall (Target &gt;=70%)</span>
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {anomalyMetrics.recallPercent}%
          </div>
          <div className="mt-1 text-xs text-slate-600 tabular-nums">
            {anomalyMetrics.detectedInjectedAnomalies} / {anomalyMetrics.totalInjectedAnomalies} injected anomalies detected
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Tracked Ledger Entities</span>
            <Database className="h-4 w-4 text-[#0B1F3A]" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {invoices.length} Invoices
          </div>
          <div className="mt-1 text-xs text-slate-600 tabular-nums">
            {totalLineItems} line items · {customers.length} customers · {products.length} SKUs
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Active Anomaly Alerts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {anomalyMetrics.totalAlerts}
          </div>
          <div className="mt-1 text-xs text-slate-600 tabular-nums">
            {anomalyMetrics.unreviewedAlerts} unreviewed · {anomalyMetrics.totalFlaggedInvoices} flagged invoices
          </div>
        </div>
      </div>

      {/* Architecture & Responsible AI Checkpoint */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#0B1F3A]" />
            <h2 className="text-base font-semibold text-slate-900">
              Full-Stack Architecture (Spring Boot &amp; MySQL)
            </h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {mode === 'preview'
              ? 'Active Mode: Preview Mode on synthetic localStorage data. Switch to Production Mode in the sidebar to connect directly to Spring Boot & MySQL (no silent mock fallback).'
              : `Active Mode: Production Mode targeting ${backendState.apiBaseUrl} (${backendState.status === 'connected' ? `Connected · Last synced ${backendState.lastSyncedAt ?? 'just now'}` : backendState.error ?? backendState.status}).`}
          </p>
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div>
                <div className="font-semibold text-slate-900">
                  Java 17 + Spring Boot 3 REST Backend
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  backend/src/main/java/com/billbook/
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-emerald-700">
                Port 8080 · Actuator
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div>
                <div className="font-semibold text-slate-900">
                  MySQL 8 Relational Schema &amp; Seed Data
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  database/schema.sql · database/seed.sql
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#0B1F3A]">
                Port 3306
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div>
                <div className="font-semibold text-slate-900">
                  Docker Compose &amp; CI/CD Pipelines
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  docker-compose.yml · .github/workflows/ci.yml · Jenkinsfile
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                JUnit 5 + Node Test
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
            <span className="font-semibold">Responsible AI &amp; Financial Integrity Policy:</span>{' '}
            Auto-categorisation and anomaly detection are strictly advisory. Tax rates, discounts, CGST/SGST/IGST splits, and invoice totals are computed deterministically and never altered without explicit human review.
          </div>
        </div>

        {/* Audit & Review Trail */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Audit &amp; Calculation Review Log
            </h2>
          </div>
          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[#0B1F3A]">
                    {log.action} · {log.entityRef}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {log.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">{log.details}</p>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  Actor: {log.actor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
