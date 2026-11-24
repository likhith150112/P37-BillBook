import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Database,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Package,
  RefreshCw,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import type {
  AppMode,
  BackendConnectionState,
  NavSection,
} from '../types/billing.ts';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  unreviewedAnomaliesCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  backendState: BackendConnectionState;
  onResetDemo: () => void;
  onSyncBackend: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create-invoice', label: 'Create Invoice', icon: FilePlus2 },
  { id: 'invoices', label: 'Invoices & History', icon: FileText },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products & HSN', icon: Package },
  { id: 'reports', label: 'Sales & GST Reports', icon: BarChart3 },
  { id: 'monitoring', label: 'Monitoring & QA', icon: Activity },
];

export function Sidebar({
  activeSection,
  onNavigate,
  unreviewedAnomaliesCount,
  mobileOpen,
  onCloseMobile,
  mode,
  onModeChange,
  backendState,
  onResetDemo,
  onSyncBackend,
}: SidebarProps) {
  const handleSelect = (id: NavSection) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden no-print"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#0B1F3A] text-slate-100 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white">
                BillBook
              </div>
              <div className="text-[11px] font-medium text-slate-300">
                GST Billing · Project P37
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const showAlertCount =
              item.id === 'invoices' && unreviewedAnomaliesCount > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {showAlertCount && (
                  <span
                    className={`tabular-nums rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {unreviewedAnomaliesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-[#122D52] p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">Runtime Mode</span>
              <span
                className={`font-mono text-[10px] font-semibold ${
                  mode === 'production'
                    ? backendState.status === 'connected'
                      ? 'text-emerald-400'
                      : 'text-amber-300'
                    : 'text-emerald-400'
                }`}
              >
                {mode === 'production' ? 'SPRING + MYSQL' : 'PREVIEW'}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-[#0B1F3A] p-1">
              <button
                type="button"
                onClick={() => onModeChange('preview')}
                aria-pressed={mode === 'preview'}
                className={`rounded px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  mode === 'preview'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => onModeChange('production')}
                aria-pressed={mode === 'production'}
                className={`rounded px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  mode === 'production'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Production
              </button>
            </div>

            {mode === 'preview' ? (
              <>
                <p className="mt-2 leading-relaxed text-slate-300">
                  Preview Mode using synthetic localStorage data. Switch to Production for live Spring Boot + MySQL persistence.
                </p>
                <button
                  type="button"
                  onClick={onResetDemo}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Demo Dataset</span>
                </button>
              </>
            ) : (
              <>
                <div className="mt-2 flex items-start gap-1.5 leading-relaxed text-slate-300">
                  <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span className="break-all font-mono text-[10px]">
                    {backendState.apiBaseUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSyncBackend}
                  disabled={backendState.status === 'loading'}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      backendState.status === 'loading' ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {backendState.status === 'loading'
                      ? 'Syncing MySQL...'
                      : 'Sync Spring Boot API'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
