import { AlertCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomersView } from './components/CustomersView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { InvoiceBuilderView } from './components/InvoiceBuilderView.tsx';
import { InvoicePrintModal } from './components/InvoicePrintModal.tsx';
import { InvoicesHistoryView } from './components/InvoicesHistoryView.tsx';
import { MonitoringView } from './components/MonitoringView.tsx';
import { ProductsView } from './components/ProductsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import {
  buildInitialInvoices,
  DEFAULT_SELLER_PROFILE,
  INITIAL_AUDIT_LOGS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
} from './data/seedData.ts';
import {
  appendAuditLogApi,
  createCustomerApi,
  createInvoiceApi,
  createProductApi,
  deleteCustomerApi,
  deleteProductApi,
  fetchBootstrapData,
  getApiBaseUrl,
  recordPaymentApi,
  reviewInvoiceAnomaliesApi,
  suggestCategoryApi,
  updateCustomerApi,
  updateProductApi,
} from './services/api.ts';
import type {
  AppMode,
  AuditLogEntry,
  BackendConnectionState,
  Customer,
  Invoice,
  NavSection,
  Product,
} from './types/billing.ts';
import { suggestProductCategorisation } from './utils/categorizer.ts';
import { downloadInvoicePdf } from './utils/pdfExport.ts';

const STORAGE_KEYS = {
  mode: 'billbook_app_mode_v1',
  customers: 'billbook_demo_customers_v1',
  products: 'billbook_demo_products_v1',
  invoices: 'billbook_demo_invoices_v1',
  logs: 'billbook_demo_logs_v1',
};

function loadStored<T>(key: string, fallback: () => T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

function loadInitialMode(): AppMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.mode);
    return saved === 'production' ? 'production' : 'preview';
  } catch {
    return 'preview';
  }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(loadInitialMode);
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadInitialMode() === 'preview'
      ? loadStored(STORAGE_KEYS.customers, () => INITIAL_CUSTOMERS)
      : []
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadInitialMode() === 'preview'
      ? loadStored(STORAGE_KEYS.products, () => INITIAL_PRODUCTS)
      : []
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadInitialMode() === 'preview'
      ? loadStored(STORAGE_KEYS.invoices, () => buildInitialInvoices())
      : []
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadInitialMode() === 'preview'
      ? loadStored(STORAGE_KEYS.logs, () => INITIAL_AUDIT_LOGS)
      : []
  );

  const [backendState, setBackendState] = useState<BackendConnectionState>(() => ({
    status: 'idle',
    error: null,
    lastSyncedAt: null,
    apiBaseUrl: getApiBaseUrl(),
  }));

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

  const syncFromBackend = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    setBackendState({
      status: 'loading',
      error: null,
      lastSyncedAt: null,
      apiBaseUrl,
    });
    try {
      const data = await fetchBootstrapData(apiBaseUrl);
      setCustomers(data.customers);
      setProducts(data.products);
      setInvoices(data.invoices);
      setAuditLogs(data.auditLogs);
      setBackendState({
        status: 'connected',
        error: null,
        lastSyncedAt: new Date().toLocaleTimeString(),
        apiBaseUrl,
      });
    } catch (err) {
      // Production Mode STRICTLY never falls back to synthetic localStorage data.
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach Spring Boot backend.';
      setCustomers([]);
      setProducts([]);
      setInvoices([]);
      setAuditLogs([]);
      setBackendState({
        status: 'error',
        error: message,
        lastSyncedAt: null,
        apiBaseUrl,
      });
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.mode, mode);
    } catch {
      // Ignore storage errors
    }

    if (mode === 'production') {
      void syncFromBackend();
    } else {
      setCustomers(loadStored(STORAGE_KEYS.customers, () => INITIAL_CUSTOMERS));
      setProducts(loadStored(STORAGE_KEYS.products, () => INITIAL_PRODUCTS));
      setInvoices(loadStored(STORAGE_KEYS.invoices, () => buildInitialInvoices()));
      setAuditLogs(loadStored(STORAGE_KEYS.logs, () => INITIAL_AUDIT_LOGS));
      setBackendState((prev) => ({
        ...prev,
        status: 'idle',
        error: null,
      }));
    }
  }, [mode, syncFromBackend]);

  useEffect(() => {
    if (mode !== 'preview') return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
      window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
      window.localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
      window.localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(auditLogs));
    } catch {
      // Ignore storage quota errors in private contexts
    }
  }, [mode, customers, products, invoices, auditLogs]);

  const appendAudit = (
    action: AuditLogEntry['action'],
    entityRef: string,
    actor: string,
    details: string
  ) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: now,
        action,
        entityRef,
        actor,
        details,
      },
      ...prev,
    ]);
  };

  const unreviewedAnomaliesCount = useMemo(
    () => invoices.filter((inv) => inv.hasUnreviewedAnomalies).length,
    [invoices]
  );

  const handleAddCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (mode === 'production') {
      try {
        const created = await createCustomerApi(data);
        setCustomers((prev) => [created, ...prev]);
        showToast(`Customer "${created.businessName || created.name}" saved to MySQL.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create customer.';
        setBackendState((prev) => ({ ...prev, status: 'error', error: msg }));
        showToast(msg);
      }
      return;
    }

    const created: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [created, ...prev]);
    appendAudit(
      'CUSTOMER_UPDATED',
      created.businessName || created.name,
      'Accountant (Demo)',
      `Added customer in ${created.city}, ${created.state}.`
    );
    showToast(`Customer "${created.businessName || created.name}" added.`);
  };

  const handleUpdateCustomer = async (updated: Customer) => {
    if (mode === 'production') {
      try {
        const saved = await updateCustomerApi(updated);
        setCustomers((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
        showToast('Customer record updated in MySQL.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update customer.';
        showToast(msg);
      }
      return;
    }

    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    appendAudit(
      'CUSTOMER_UPDATED',
      updated.businessName || updated.name,
      'Accountant (Demo)',
      `Updated billing details for ${updated.businessName || updated.name}.`
    );
    showToast('Customer record updated.');
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (mode === 'production') {
      try {
        await deleteCustomerApi(customerId);
        setCustomers((prev) => prev.filter((c) => c.id !== customerId));
        showToast('Customer deleted from MySQL.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete customer.';
        showToast(msg);
      }
      return;
    }

    const target = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (target) {
      appendAudit(
        'CUSTOMER_UPDATED',
        target.businessName || target.name,
        'Accountant (Demo)',
        'Removed customer from active directory.'
      );
      showToast('Customer removed.');
    }
  };

  const handleSuggestCategory = async (name: string, description: string) => {
    if (mode === 'production') {
      return suggestCategoryApi(name, description);
    }
    return suggestProductCategorisation(name, description);
  };

  const handleAddProduct = async (data: Omit<Product, 'id'>) => {
    if (mode === 'production') {
      try {
        const created = await createProductApi(data);
        setProducts((prev) => [created, ...prev]);
        showToast(`Product "${created.name}" saved to MySQL.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create product.';
        showToast(msg);
      }
      return;
    }

    const created: Product = {
      ...data,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [created, ...prev]);
    if (created.autoCategorised) {
      appendAudit(
        'PRODUCT_CATEGORISED',
        created.sku,
        'Accountant (Demo)',
        `Confirmed HSN ${created.hsnCode} (${created.gstRate}% GST) for ${created.name}.`
      );
    }
    showToast(`Product "${created.name}" added to catalog.`);
  };

  const handleUpdateProduct = async (updated: Product) => {
    if (mode === 'production') {
      try {
        const saved = await updateProductApi(updated);
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        showToast(`Product "${saved.name}" updated in MySQL.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update product.';
        showToast(msg);
      }
      return;
    }

    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Product "${updated.name}" updated.`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (mode === 'production') {
      try {
        await deleteProductApi(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast('Product removed from MySQL catalog.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete product.';
        showToast(msg);
      }
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from catalog.');
  };

  const handleCreateInvoice = async (
    invoice: Invoice,
    downloadPdfAfter: boolean,
    anomalyConfirmed = false
  ) => {
    if (mode === 'production') {
      const saved = await createInvoiceApi(invoice, anomalyConfirmed);
      setInvoices((prev) => [saved, ...prev]);
      const logs = await fetchBootstrapData().then((d) => d.auditLogs).catch(() => auditLogs);
      setAuditLogs(logs);
      if (downloadPdfAfter) {
        downloadInvoicePdf(saved, DEFAULT_SELLER_PROFILE);
        showToast(`Invoice ${saved.invoiceNumber} saved to MySQL and PDF downloaded.`);
      } else {
        showToast(`Invoice ${saved.invoiceNumber} persisted to MySQL.`);
      }
      setPreviewInvoice(saved);
      setActiveSection('invoices');
      return;
    }

    setInvoices((prev) => [invoice, ...prev]);
    appendAudit(
      'INVOICE_CREATED',
      invoice.invoiceNumber,
      'Accountant (Demo)',
      `Issued ${invoice.supplyType} invoice for ${invoice.customerName} (${invoice.items.length} items).`
    );
    if (downloadPdfAfter) {
      downloadInvoicePdf(invoice, DEFAULT_SELLER_PROFILE);
      showToast(`Invoice ${invoice.invoiceNumber} saved and PDF downloaded.`);
    } else {
      showToast(`Invoice ${invoice.invoiceNumber} issued successfully.`);
    }
    setPreviewInvoice(invoice);
    setActiveSection('invoices');
  };

  const handleMarkPaid = async (invoiceId: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    if (mode === 'production') {
      try {
        const updated = await recordPaymentApi(invoiceId, target.grandTotal);
        setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
        showToast(`Invoice ${updated.invoiceNumber} marked PAID in MySQL.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to update payment.');
      }
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, amountPaid: inv.grandTotal, paymentStatus: 'PAID' }
          : inv
      )
    );
    appendAudit(
      'PAYMENT_RECORDED',
      target.invoiceNumber,
      'Accountant (Demo)',
      'Marked invoice PAID in full.'
    );
    showToast(`Invoice ${target.invoiceNumber} marked PAID.`);
  };

  const handleRecordPayment = async (invoiceId: string, newAmountPaid: number) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    if (mode === 'production') {
      try {
        const updated = await recordPaymentApi(invoiceId, newAmountPaid);
        setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
        showToast(`Payment saved in MySQL for ${updated.invoiceNumber}.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to record payment.');
      }
      return;
    }

    const isPaid = newAmountPaid >= target.grandTotal;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              amountPaid: newAmountPaid,
              paymentStatus: isPaid
                ? 'PAID'
                : newAmountPaid > 0
                  ? 'PARTIAL'
                  : inv.paymentStatus,
            }
          : inv
      )
    );
    appendAudit(
      'PAYMENT_RECORDED',
      target.invoiceNumber,
      'Accountant (Demo)',
      `Updated amount paid to ₹${newAmountPaid.toFixed(2)}.`
    );
    showToast(`Payment updated for ${target.invoiceNumber}.`);
  };

  const handleResolveAnomaly = async (invoiceId: string, note: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    if (mode === 'production') {
      try {
        const updated = await reviewInvoiceAnomaliesApi(invoiceId, note);
        setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
        showToast(`Anomaly review saved to MySQL for ${updated.invoiceNumber}.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to review anomaly.');
      }
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              anomalies: inv.anomalies.map((a) => ({
                ...a,
                reviewed: true,
                reviewerNote: note,
              })),
              hasUnreviewedAnomalies: false,
            }
          : inv
      )
    );
    appendAudit(
      'ANOMALY_REVIEWED',
      target.invoiceNumber,
      'Accountant (Demo)',
      note
    );
    showToast(`Anomalies reviewed for ${target.invoiceNumber}.`);
  };

  const handleResetDemo = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setInvoices(buildInitialInvoices());
    setAuditLogs(INITIAL_AUDIT_LOGS);
    window.localStorage.removeItem(STORAGE_KEYS.customers);
    window.localStorage.removeItem(STORAGE_KEYS.products);
    window.localStorage.removeItem(STORAGE_KEYS.invoices);
    window.localStorage.removeItem(STORAGE_KEYS.logs);
    showToast('Synthetic demo dataset restored.');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        unreviewedAnomaliesCount={unreviewedAnomaliesCount}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        mode={mode}
        onModeChange={setMode}
        backendState={backendState}
        onResetDemo={handleResetDemo}
        onSyncBackend={() => void syncFromBackend()}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeSection={activeSection}
          seller={DEFAULT_SELLER_PROFILE}
          mode={mode}
          backendState={backendState}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onQuickCreateInvoice={() => setActiveSection('create-invoice')}
        />

        <main className="no-print flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {mode === 'production' && backendState.status === 'error' && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <div className="font-semibold">
                      Production Backend Unavailable (No Silent Mock Fallback)
                    </div>
                    <p className="mt-0.5 text-xs text-red-800">
                      {backendState.error}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void syncFromBackend()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#122D52]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Retry Connection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                  >
                    Switch to Preview Mode
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'dashboard' && (
              <DashboardView
                invoices={invoices}
                onNavigate={setActiveSection}
                onInspectInvoice={(inv) => setPreviewInvoice(inv)}
                onMarkPaid={(id) => void handleMarkPaid(id)}
              />
            )}

            {activeSection === 'create-invoice' && (
              <InvoiceBuilderView
                seller={DEFAULT_SELLER_PROFILE}
                customers={customers}
                products={products}
                existingInvoices={invoices}
                onCreateInvoice={handleCreateInvoice}
              />
            )}

            {activeSection === 'invoices' && (
              <InvoicesHistoryView
                invoices={invoices}
                seller={DEFAULT_SELLER_PROFILE}
                onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
                onRecordPayment={(id, amt) => void handleRecordPayment(id, amt)}
                onResolveAnomaly={(id, note) => void handleResolveAnomaly(id, note)}
              />
            )}

            {activeSection === 'customers' && (
              <CustomersView
                customers={customers}
                invoices={invoices}
                onAddCustomer={(c) => void handleAddCustomer(c)}
                onUpdateCustomer={(c) => void handleUpdateCustomer(c)}
                onDeleteCustomer={(id) => void handleDeleteCustomer(id)}
              />
            )}

            {activeSection === 'products' && (
              <ProductsView
                products={products}
                onAddProduct={(p) => void handleAddProduct(p)}
                onUpdateProduct={(p) => void handleUpdateProduct(p)}
                onDeleteProduct={(id) => void handleDeleteProduct(id)}
                onSuggestCategory={handleSuggestCategory}
              />
            )}

            {activeSection === 'reports' && (
              <ReportsView invoices={invoices} />
            )}

            {activeSection === 'monitoring' && (
              <MonitoringView
                invoices={invoices}
                customers={customers}
                products={products}
                auditLogs={auditLogs}
                mode={mode}
                backendState={backendState}
                onBenchmarkExecuted={(res) => {
                  const details = `Passed ${res.passedCases}/${res.totalCases} GST assertions (${res.accuracyPercent}% accuracy).`;
                  if (mode === 'production') {
                    void appendAuditLogApi({
                      action: 'GST_BENCHMARK_RUN',
                      entityRef: '50-Case Suite',
                      actor: 'Verification Engine',
                      details,
                    })
                      .then((saved) => setAuditLogs((prev) => [saved, ...prev]))
                      .catch(() => {});
                  } else {
                    appendAudit(
                      'GST_BENCHMARK_RUN',
                      '50-Case Suite',
                      'Verification Engine',
                      details
                    );
                  }
                  showToast(
                    `GST 50-case verification passed (${res.passedCases}/${res.totalCases}).`
                  );
                }}
              />
            )}
          </div>
        </main>
      </div>

      <InvoicePrintModal
        invoice={previewInvoice}
        seller={DEFAULT_SELLER_PROFILE}
        onClose={() => setPreviewInvoice(null)}
      />

      {toastMessage && (
        <div
          role="status"
          className="no-print fixed right-4 bottom-4 z-50 rounded-lg bg-[#0B1F3A] px-4 py-3 text-xs font-semibold text-white shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
