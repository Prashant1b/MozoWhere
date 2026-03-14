import React, { useEffect, useMemo, useState } from "react";
import { customizeTemplateApi } from "../../api/customizeTemplate.api";
import CustomizeTemplateFormModal from "./CustomizeTemplateFormModal";
import { Shirt, Search, Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCustomizeTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await customizeTemplateApi.list({ q: q || undefined, type: type || undefined });
      setItems(res.data?.templates || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load templates");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term && !type) return items;
    return items.filter((t) => {
      const okType = !type || String(t?.type || "") === type;
      const okQ = !term || String(t?.title || "").toLowerCase().includes(term) || String(t?.slug || "").toLowerCase().includes(term);
      return okType && okQ;
    });
  }, [items, q, type]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setModalOpen(true); };

  const onSubmit = async (payload) => {
    setErr(""); setSaving(true);
    try {
      if (editing?._id) {
        const res = await customizeTemplateApi.update(editing._id, payload);
        const updated = res.data?.template;
        setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      } else {
        const res = await customizeTemplateApi.create(payload);
        const created = res.data?.template;
        setItems((prev) => [created, ...prev]);
      }
      setModalOpen(false); setEditing(null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const onDelete = async (t) => {
    if (!window.confirm(`Delete template: ${t?.title}?`)) return;
    setErr(""); setSaving(true);
    try {
      await customizeTemplateApi.remove(t._id);
      setItems((prev) => prev.filter((x) => x._id !== t._id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Shirt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Templates</h1>
              <p className="text-xs text-slate-500">{items.length} templates</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400">
              <option value="">All Types</option>
              <option value="tshirt">tshirt</option>
              <option value="hoodie">hoodie</option>
              <option value="cap">cap</option>
              <option value="mug">mug</option>
              <option value="pen">pen</option>
              <option value="accessory">accessory</option>
            </select>
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 sm:w-[200px]" />
            </div>
            <button onClick={load} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50 transition">Search</button>
            <button onClick={openCreate} className="flex items-center gap-1.5 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Colors</th>
                <th className="px-4 py-3">Sizes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>No templates.</td></tr>
              ) : filtered.map((t) => (
                <tr key={t._id} className="text-sm hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-500">{t.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700">{t.type || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">Rs {t.basePrice ?? "-"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[150px] truncate">{Array.isArray(t.colors) ? t.colors.join(", ") : "-"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{Array.isArray(t.sizes) ? t.sizes.join(", ") : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                        <Pencil size={14} className="text-slate-600" />
                      </button>
                      <button onClick={() => onDelete(t)} disabled={saving} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50">
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
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">No templates.</div>
        ) : filtered.map((t) => (
          <div key={t._id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900">{t.title}</div>
                <div className="text-[11px] text-slate-500">{t.slug}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">{t.type || "-"}</span>
                  <span className="text-[10px] text-slate-500">Rs {t.basePrice ?? "-"}</span>
                </div>
                {Array.isArray(t.colors) && t.colors.length > 0 && (
                  <div className="mt-1 text-[10px] text-slate-400 truncate">Colors: {t.colors.join(", ")}</div>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => onDelete(t)} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <CustomizeTemplateFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={onSubmit}
        saving={saving}
        initial={editing}
      />
    </div>
  );
}
