import { FilePlus2, Menu } from 'lucide-react';
import type {
  AppMode,
  BackendConnectionState,
  NavSection,
  SellerProfile,
} from '../types/billing.ts';

interface TopBarProps {
  activeSection: NavSection;
  seller: SellerProfile;
  mode: AppMode;
  backendState: BackendConnectionState;
  onOpenMobileMenu: () => void;
  onQuickCreateInvoice: () => void;
}

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Business Dashboard',
  'create-invoice': 'Create GST Invoice',
  invoices: 'Invoices & Payment Ledger',
  customers: 'Customers Directory',
  products: 'Products & HSN Catalog',
  reports: 'Sales & GSTR-1 Reports',
  monitoring: 'Monitoring & Quality Assurance',
};

export function TopBar({
  activeSection,
  seller,
  mode,
  backendState,
  onOpenMobileMenu,
  onQuickCreateInvoice,
}: TopBarProps) {
  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">BillBook</span>
            <span>/</span>
            <span className="truncate">{SECTION_TITLES[activeSection]}</span>
          </div>
          <div className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">
            {seller.businessName} · GSTIN{' '}
            <span className="font-mono text-slate-700">{seller.gstin}</span> ·{' '}
            {seller.state} ({seller.stateCode})
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div
          className={`hidden rounded-md border px-2.5 py-1 text-xs font-semibold md:block ${
            mode === 'preview'
              ? 'border-slate-200 bg-slate-50 text-slate-700'
              : backendState.status === 'connected'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {mode === 'preview'
            ? 'Preview Mode · Synthetic Data'
            : backendState.status === 'connected'
              ? 'Production · MySQL Connected'
              : backendState.status === 'loading'
                ? 'Production · Connecting...'
                : 'Production · Backend Offline'}
        </div>

        {activeSection !== 'create-invoice' && (
          <button
            type="button"
            onClick={onQuickCreateInvoice}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>New Invoice</span>
          </button>
        )}
      </div>
    </header>
  );
}
