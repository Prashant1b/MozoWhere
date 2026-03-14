import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Sparkles, X } from "lucide-react";
import { serviceApi } from "../../api/service.api";

function ServiceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: "", subtitle: "", image: "", path: "", sortOrder: 0, isActive: true });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const inputCls = "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400";

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-bold text-slate-900">{initial?._id ? "Edit Service" : "New Service"}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Service name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input className={inputCls} placeholder="Subtitle" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        <input className={`${inputCls} sm:col-span-2`} placeholder="Background image URL" value={form.image} onChange={(e) => set("image", e.target.value)} />
        <input className={inputCls} placeholder="Route path (e.g. /shop)" value={form.path} onChange={(e) => set("path", e.target.value)} />
        <input className={inputCls} placeholder="Sort order" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-indigo-600" /> Active
      </label>
      {form.image && (
        <div className="h-20 w-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
          <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="h-9 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition">
          {initial?._id ? "Update" : "Create"}
        </button>
        <button onClick={onCancel} className="h-9 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await serviceApi.listAll();
      setServices(res.data?.services || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load services");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSave = async (form) => {
    try {
      if (editing?._id) { await serviceApi.update(editing._id, form); }
      else { await serviceApi.create(form); }
      setEditing(null); setMsg(""); load();
    } catch (e) { setMsg(e?.response?.data?.message || "Save failed"); }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    try { await serviceApi.remove(id); load(); }
    catch (e) { setMsg(e?.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Services</h1>
              <p className="text-xs text-slate-500">{services.length} services</p>
            </div>
          </div>
          <button onClick={() => setEditing(editing ? null : "new")}
            className="flex items-center gap-1.5 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            {editing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">{editing ? "Cancel" : "Add"}</span>
          </button>
        </div>
        {msg && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{msg}</div>}
      </div>

      {editing && (
        <ServiceForm
          initial={editing === "new" ? null : editing}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">Loading...</div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">No services yet.</div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s._id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              {s.image ? (
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-14 w-20 shrink-0 rounded-xl border border-slate-200 bg-slate-100 grid place-items-center text-xs text-slate-400">No img</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm truncate">{s.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{s.subtitle || "-"} | {s.path}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {s.isActive ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-slate-400" />}
                  <span className="text-[10px] text-slate-400">Order: {s.sortOrder}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setEditing(s)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                  <Pencil size={14} className="text-slate-600" />
                </button>
                <button onClick={() => onDelete(s._id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
