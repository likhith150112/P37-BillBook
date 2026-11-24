import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Customer, Invoice } from '../types/billing.ts';
import { formatINR, INDIAN_STATES } from '../utils/gstCalculator.ts';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

interface CustomerFormState {
  name: string;
  businessName: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM: CustomerFormState = {
  name: '',
  businessName: '',
  gstin: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: 'Karnataka',
  pincode: '',
};

export function CustomersView({
  customers,
  invoices,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const revenueByCustomer = useMemo(() => {
    const map = new Map<string, { billed: number; count: number }>();
    for (const inv of invoices) {
      const prev = map.get(inv.customerId) ?? { billed: 0, count: 0 };
      prev.billed += inv.grandTotal;
      prev.count += 1;
      map.set(inv.customerId, prev);
    }
    return map;
  }, [invoices]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter((c) => {
      if (stateFilter !== 'ALL' && c.state !== stateFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.businessName ?? '').toLowerCase().includes(q) ||
        (c.gstin ?? '').toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery, stateFilter]);

  const uniqueStates = useMemo(
    () => Array.from(new Set(customers.map((c) => c.state))).sort(),
    [customers]
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      businessName: c.businessName ?? '',
      gstin: c.gstin ?? '',
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
      setFormError('Contact name, phone number, and city are required.');
      return;
    }
    if (form.gstin.trim() && form.gstin.trim().length !== 15) {
      setFormError('Indian GSTIN must be 15 alphanumeric characters (or leave blank for B2C).');
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: form.name.trim(),
        businessName: form.businessName.trim() || undefined,
        gstin: form.gstin.trim().toUpperCase() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
      });
    } else {
      onAddCustomer({
        name: form.name.trim(),
        businessName: form.businessName.trim() || undefined,
        gstin: form.gstin.trim().toUpperCase() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers Directory
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage B2B GSTIN and B2C retail accounts. Customer state determines intra-state CGST+SGST vs inter-state IGST.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, business name, GSTIN, city, or phone..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          aria-label="Filter customers by state"
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600"
        >
          <option value="ALL">All States ({customers.length})</option>
          {uniqueStates.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredCustomers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No customers match your current filter.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#122D52]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Customer</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Business / Contact</th>
                  <th className="px-4 py-3 font-semibold">GSTIN</th>
                  <th className="px-4 py-3 font-semibold">Location &amp; Tax Mode</th>
                  <th className="px-4 py-3 font-semibold">Phone &amp; Email</th>
                  <th className="px-4 py-3 text-right font-semibold">Billed Volume</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => {
                  const stats = revenueByCustomer.get(customer.id) ?? {
                    billed: 0,
                    count: 0,
                  };
                  const isIntra = customer.state === 'Karnataka';
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {customer.businessName || customer.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Attn: {customer.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        {customer.gstin ? customer.gstin : 'Unregistered (B2C)'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800">
                          {customer.city}, {customer.state}
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            isIntra ? 'text-emerald-700' : 'text-[#0B1F3A]'
                          }`}
                        >
                          {isIntra ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="font-mono text-slate-800">{customer.phone}</div>
                        <div>{customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono font-semibold text-slate-900 tabular-nums">
                          {formatINR(stats.billed)}
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {stats.count} invoices
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(customer)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Edit ${customer.businessName || customer.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(customer)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${customer.businessName || customer.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="e.g. Rohan Verma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Business / Firm Name
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) =>
                      setForm({ ...form, businessName: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="e.g. Verma Traders"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    GSTIN (15-char, optional)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={form.gstin}
                    onChange={(e) =>
                      setForm({ ...form, gstin: e.target.value.toUpperCase() })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-emerald-600"
                    placeholder="29AABCV1234F1Z5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="+91 98450 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  placeholder="accounts@company.example"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Billing Street Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  placeholder="Street, Area, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="Bengaluru"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    State *
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
                    placeholder="560001"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-900">
              Delete Customer?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-900">
                {deleteTarget.businessName || deleteTarget.name}
              </span>
              ? Existing historical invoices will retain their billed snapshot.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCustomer(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
