import React, { useEffect, useMemo, useState } from "react";
import { productApi } from "../../api/product.api";
import ProductFormModal from "./ProductFormModal";
import { ShoppingBag, Search, Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async (query = q) => {
    setErr("");
    setLoading(true);
    try {
      const res = await productApi.list({ q: query, limit: 50, sort: "-createdAt" });
      setItems(res.data?.products || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(""); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) => {
      const t = String(p?.title || "").toLowerCase();
      const s = String(p?.slug || "").toLowerCase();
      const c = String(p?.category?.name || p?.category?.slug || "").toLowerCase();
      const g = String(p?.gender || "").toLowerCase();
      return t.includes(term) || s.includes(term) || c.includes(term) || g.includes(term);
    });
  }, [items, q]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setModalOpen(true); };

  const onSubmit = async (payload) => {
    setErr("");
    setSaving(true);
    try {
      if (editing?._id) {
        const res = await productApi.update(editing._id, payload);
        const updated = res.data?.product;
        setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      } else {
        const res = await productApi.create(payload);
        const created = res.data?.product;
        setItems((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete product: ${p?.title}?`)) return;
    setErr("");
    setSaving(true);
    try {
      await productApi.remove(p._id);
      setItems((prev) => prev.filter((x) => x._id !== p._id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Products</h1>
              <p className="text-xs text-slate-500">{items.length} products</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 sm:w-[240px]"
              />
            </div>
            <button onClick={openCreate} className="flex items-center gap-1.5 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 shrink-0 transition">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>No products found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id} className="text-sm hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs">{p?.category?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{p?.gender || "-"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.discountPrice != null ? (
                      <div>
                        <div className="font-semibold text-slate-900">Rs {p.discountPrice}</div>
                        <div className="text-xs text-slate-400 line-through">Rs {p.basePrice}</div>
                      </div>
                    ) : (
                      <div className="font-semibold text-slate-900">Rs {p.basePrice}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                        <Pencil size={14} className="text-slate-600" />
                      </button>
                      <button onClick={() => onDelete(p)} disabled={saving} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">No products found.</div>
        ) : filtered.map((p) => (
          <div key={p._id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900 truncate">{p.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{p.slug}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{p?.category?.name || "-"}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{p?.gender || "-"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
              <div className="text-right ml-3 shrink-0">
                {p.discountPrice != null ? (
                  <>
                    <div className="text-sm font-bold text-slate-900">Rs {p.discountPrice}</div>
                    <div className="text-[11px] text-slate-400 line-through">Rs {p.basePrice}</div>
                  </>
                ) : (
                  <div className="text-sm font-bold text-slate-900">Rs {p.basePrice}</div>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => onDelete(p)} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={onSubmit}
        saving={saving}
        initial={editing}
      />
    </div>
  );
}
