import { Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CategorySuggestion, GstRate, Product } from '../types/billing.ts';
import { suggestProductCategorisation } from '../utils/categorizer.ts';
import { formatINR } from '../utils/gstCalculator.ts';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void | Promise<void>;
  onUpdateProduct: (product: Product) => void | Promise<void>;
  onDeleteProduct: (productId: string) => void | Promise<void>;
  onSuggestCategory?: (name: string, description: string) => Promise<CategorySuggestion>;
}

interface ProductFormState {
  sku: string;
  name: string;
  description: string;
  hsnCode: string;
  category: string;
  unitPrice: string;
  gstRate: GstRate;
  unit: string;
  stockQty: string;
  autoCategorised: boolean;
  categorisationRule: string;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  sku: '',
  name: '',
  description: '',
  hsnCode: '',
  category: '',
  unitPrice: '',
  gstRate: 18,
  unit: 'Nos',
  stockQty: '25',
  autoCategorised: false,
  categorisationRule: '',
};

const GST_SLABS: GstRate[] = [0, 5, 12, 18, 28];

export function ProductsView({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSuggestCategory,
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gstFilter, setGstFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (gstFilter !== 'ALL' && String(p.gstRate) !== gstFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.hsnCode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, gstFilter]);

  const openAddModal = () => {
    const nextNum = String(products.length + 1).padStart(2, '0');
    setEditingProduct(null);
    setForm({
      ...EMPTY_PRODUCT_FORM,
      sku: `BB-NEW-${nextNum}`,
    });
    setSuggestion(null);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      hsnCode: p.hsnCode,
      category: p.category,
      unitPrice: String(p.unitPrice),
      gstRate: p.gstRate,
      unit: p.unit,
      stockQty: String(p.stockQty),
      autoCategorised: Boolean(p.autoCategorised),
      categorisationRule: p.categorisationRule ?? '',
    });
    setSuggestion(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleRunAutoCategorise = async () => {
    setFormError('');
    if (onSuggestCategory) {
      try {
        const result = await onSuggestCategory(form.name, form.description);
        setSuggestion(result);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : 'Unable to fetch category suggestion from backend.'
        );
      }
      return;
    }
    const result = suggestProductCategorisation(form.name, form.description);
    setSuggestion(result);
  };

  const handleApplySuggestion = () => {
    if (!suggestion) return;
    setForm((prev) => ({
      ...prev,
      category: suggestion.category,
      hsnCode: suggestion.hsnCode,
      gstRate: suggestion.suggestedGstRate,
      autoCategorised: true,
      categorisationRule: suggestion.explanation,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.unitPrice);
    const stock = Number(form.stockQty);
    if (!form.name.trim() || !form.hsnCode.trim() || !form.category.trim()) {
      setFormError('Product name, HSN/SAC code, and category are required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Unit price must be a positive number.');
      return;
    }

    const payload: Omit<Product, 'id'> = {
      sku: form.sku.trim() || `BB-${Date.now().toString().slice(-4)}`,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      hsnCode: form.hsnCode.trim(),
      category: form.category.trim(),
      unitPrice: Math.round(price * 100) / 100,
      gstRate: form.gstRate,
      unit: form.unit.trim() || 'Nos',
      stockQty: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
      autoCategorised: form.autoCategorised,
      categorisationRule: form.categorisationRule || undefined,
    };

    if (editingProduct) {
      onUpdateProduct({ ...payload, id: editingProduct.id });
    } else {
      onAddProduct(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products &amp; HSN Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Configure SKUs, HSN/SAC codes, prices, and GST slabs. Auto-categorisation provides advisory suggestions for human confirmation.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
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
            placeholder="Search by product name, SKU, HSN code, or category..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>
        <select
          value={gstFilter}
          onChange={(e) => setGstFilter(e.target.value)}
          aria-label="Filter products by GST slab"
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600"
        >
          <option value="ALL">All GST Slabs ({products.length})</option>
          {GST_SLABS.map((rate) => (
            <option key={rate} value={String(rate)}>
              {rate}% GST Slab
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No catalog items match your search.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#122D52]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">SKU &amp; Product</th>
                  <th className="px-4 py-3 font-semibold">HSN / SAC</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                  <th className="px-4 py-3 text-right font-semibold">GST Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {product.name}
                      </div>
                      <div className="font-mono text-xs text-slate-500">
                        {product.sku}
                        {product.description ? ` · ${product.description}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                      {product.hsnCode}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div>{product.category}</div>
                      {product.autoCategorised && (
                        <div className="text-[11px] text-emerald-700">
                          Rule-suggested &amp; verified
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {formatINR(product.unitPrice)}
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        /{product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-[#0B1F3A] tabular-nums">
                      {product.gstRate}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {product.stockQty}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Product / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="e.g. HP LaserJet Pro Printer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
                    placeholder="BB-PRT-01"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Description (optional, improves auto-categorisation)
                  </label>
                  <button
                    type="button"
                    onClick={handleRunAutoCategorise}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0B1F3A] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#122D52]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Auto-Categorise Item</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  placeholder="e.g. Duplex office laser printer with Wi-Fi"
                />
              </div>

              {suggestion && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-emerald-900">
                        Advisory Categorisation ({Math.round(suggestion.confidence * 100)}% confidence)
                      </div>
                      <div className="mt-0.5 text-slate-700">
                        Suggested: <span className="font-semibold">{suggestion.category}</span> · HSN{' '}
                        <span className="font-mono font-semibold">{suggestion.hsnCode}</span> · GST{' '}
                        <span className="font-mono font-semibold">{suggestion.suggestedGstRate}%</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="shrink-0 self-start rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 sm:self-auto"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                  <p className="mt-1.5 text-slate-600">{suggestion.explanation}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="Printers & Scanners"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    HSN / SAC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.hsnCode}
                    onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
                    placeholder="8443"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    GST Slab *
                  </label>
                  <select
                    value={form.gstRate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gstRate: Number(e.target.value) as GstRate,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
                  >
                    {GST_SLABS.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}% GST
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Unit Price (INR) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.unitPrice}
                    onChange={(e) =>
                      setForm({ ...form, unitPrice: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
                    placeholder="14500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="Nos / Box / Kg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQty}
                    onChange={(e) =>
                      setForm({ ...form, stockQty: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600"
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
                  {editingProduct ? 'Save Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-900">
              Delete Product?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Remove <span className="font-semibold text-slate-900">{deleteTarget.name}</span> from your product catalog?
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
                  onDeleteProduct(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
