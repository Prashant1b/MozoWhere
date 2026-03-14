import React, { useEffect, useMemo, useState } from "react";
import { variantApi } from "../../api/variant.api";
import { X, Layers, Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const inputCls = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400";

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-3">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminVariantsPage() {
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ productId: "", size: "", color: "", sku: "", price: "", stock: "", image: "", isActive: true });

  const params = useMemo(() => {
    const p = { page, limit };
    if (q.trim()) p.q = q.trim();
    if (isActive !== "") p.isActive = isActive;
    if (productId.trim()) p.productId = productId.trim();
    return p;
  }, [q, isActive, productId, page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await variantApi.adminListAll(params);
      setRows(res.data?.variants ?? []);
      setPagination(res.data?.pagination ?? { total: 0, pages: 1 });
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load variants");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [params]);

  const resetForm = () => {
    setEditing(null);
    setForm({ productId: "", size: "", color: "", sku: "", price: "", stock: "", image: "", isActive: true });
  };

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (v) => {
    setEditing(v);
    setForm({
      productId: v.product?._id || v.product || "",
      size: v.size || "", color: v.color || "", sku: v.sku || "",
      price: v.price ?? "", stock: v.stock ?? "", image: v.image || "", isActive: !!v.isActive,
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const pid = form.productId.trim();
    if (!pid) return alert("Product ID is required");
    if (!form.size.trim() || !form.color.trim()) return alert("Size & Color are required");
    const payload = {
      size: form.size.trim(), color: form.color.trim(), sku: form.sku?.trim() || undefined,
      price: form.price === "" ? undefined : Number(form.price),
      stock: form.stock === "" ? 0 : Number(form.stock),
      image: form.image?.trim() || undefined, isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (editing?._id) await variantApi.update(editing._id, payload);
      else await variantApi.create(pid, payload);
      setOpen(false); resetForm(); load();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this variant?")) return;
    try { await variantApi.remove(id); load(); } catch (e) { alert(e?.response?.data?.message || "Delete failed"); }
  };

  const onToggle = async (id) => {
    try { await variantApi.toggleActive(id); load(); } catch (e) { alert(e?.response?.data?.message || "Toggle failed"); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Variants</h1>
              <p className="text-xs text-slate-500">{pagination.total} total</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search sku / size / color" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
          </div>
          <input value={productId} onChange={(e) => { setProductId(e.target.value); setPage(1); }} placeholder="Product ID" className={inputCls} />
          <select value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }} className={inputCls}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button onClick={() => { setQ(""); setProductId(""); setIsActive(""); setPage(1); }}
            className="h-10 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition">Clear</button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={8}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={8}>No variants found.</td></tr>
              ) : rows.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">{v.product?.title || "—"}</div>
                  </td>
                  <td className="px-4 py-3">{v.size}</td>
                  <td className="px-4 py-3">{v.color}</td>
                  <td className="px-4 py-3 text-slate-500">{v.sku || "—"}</td>
                  <td className="px-4 py-3">{v.price ?? "—"}</td>
                  <td className="px-4 py-3">{v.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${v.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => onToggle(v._id)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition" title={v.isActive ? "Disable" : "Enable"}>
                        {v.isActive ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} className="text-slate-400" />}
                      </button>
                      <button onClick={() => openEdit(v)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                        <Pencil size={14} className="text-slate-600" />
                      </button>
                      <button onClick={() => onDelete(v._id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
          <span className="text-slate-500">Total: <b className="text-slate-900">{pagination.total}</b></span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition">Prev</button>
            <span className="text-xs text-slate-600">{page} / {pagination.pages || 1}</span>
            <button disabled={page >= (pagination.pages || 1)} onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition">Next</button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">No variants.</div>
        ) : rows.map((v) => (
          <div key={v._id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">{v.product?.title || "—"}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{v.size}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{v.color}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${v.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {v.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Price: {v.price ?? "—"} · Stock: {v.stock ?? 0} {v.sku && `· ${v.sku}`}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => onToggle(v._id)} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
                {v.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />} Toggle
              </button>
              <button onClick={() => openEdit(v)} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => onDelete(v._id)} className="flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {/* Mobile pagination */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-xs text-slate-500">Total: <b>{pagination.total}</b></span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold disabled:opacity-50">Prev</button>
            <span className="text-xs">{page}/{pagination.pages || 1}</span>
            <button disabled={page >= (pagination.pages || 1)} onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={open} title={editing ? "Update Variant" : "Create Variant"} onClose={() => { setOpen(false); resetForm(); }}>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500">Product ID</label>
            <input value={form.productId} onChange={(e) => setForm((s) => ({ ...s, productId: e.target.value }))} placeholder="Enter productId" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Size</label>
            <input value={form.size} onChange={(e) => setForm((s) => ({ ...s, size: e.target.value }))} placeholder="M / L / XL" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Color</label>
            <input value={form.color} onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))} placeholder="Black / White" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">SKU (optional)</label>
            <input value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Price</label>
            <input type="number" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Stock</label>
            <input type="number" value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500">Image URL</label>
            <input value={form.image} onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))} className={inputCls} />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} className="accent-indigo-600" /> Active
          </label>
          <div className="sm:col-span-2 pt-2">
            <button type="submit" disabled={saving} className="h-10 w-full rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
