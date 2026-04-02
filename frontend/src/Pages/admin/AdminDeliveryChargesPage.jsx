import React, { useEffect, useMemo, useState } from "react";
import { deliveryApi } from "../../api/delivery.api";
import { Truck, Plus, Trash2, Search, RefreshCw, Upload, X } from "lucide-react";

export default function AdminDeliveryChargesPage() {
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({ pincode: "", city: "", state: "", charge: "", freeAbove: "" });
  const [editId, setEditId] = useState(null);
  const [bulkText, setBulkText] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await deliveryApi.list();
      setCharges(res.data?.charges || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load delivery charges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return charges;
    return charges.filter((c) =>
      c.pincode?.includes(term) ||
      c.city?.toLowerCase().includes(term) ||
      c.state?.toLowerCase().includes(term)
    );
  }, [charges, q]);

  const resetForm = () => {
    setForm({ pincode: "", city: "", state: "", charge: "", freeAbove: "" });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (c) => {
    setForm({
      pincode: c.pincode || "",
      city: c.city || "",
      state: c.state || "",
      charge: String(c.charge ?? ""),
      freeAbove: String(c.freeAbove ?? ""),
    });
    setEditId(c._id);
    setShowForm(true);
    setShowBulk(false);
  };

  const onSave = async () => {
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setErr("Valid 6-digit pincode required");
      return;
    }
    if (form.charge === "" || Number(form.charge) < 0) {
      setErr("Delivery charge must be >= 0");
      return;
    }
    setErr("");
    setSaving(true);
    try {
      await deliveryApi.upsert({
        pincode: form.pincode.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        charge: Number(form.charge),
        freeAbove: Number(form.freeAbove || 0),
      });
      resetForm();
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this delivery charge?")) return;
    setDeleting(id);
    try {
      await deliveryApi.remove(id);
      setCharges((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const onBulkImport = async () => {
    setErr("");
    try {
      const lines = bulkText.trim().split("\n").filter(Boolean);
      const parsed = lines.map((line) => {
        const parts = line.split(",").map((s) => s.trim());
        return {
          pincode: parts[0] || "",
          city: parts[1] || "",
          state: parts[2] || "",
          charge: Number(parts[3] || 0),
          freeAbove: Number(parts[4] || 0),
        };
      });

      if (!parsed.length) {
        setErr("No valid entries found");
        return;
      }

      setSaving(true);
      await deliveryApi.bulkImport(parsed);
      setBulkText("");
      setShowBulk(false);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Bulk import failed");
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
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Delivery Charges</h1>
              <p className="text-xs text-slate-500">{charges.length} pincodes configured</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pincode, city..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 sm:w-[220px]"
              />
            </div>
            <button onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0" title="Bulk Import">
              <Upload className="h-4 w-4" />
            </button>
            <button onClick={load}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={() => { setShowForm(true); setShowBulk(false); setEditId(null); setForm({ pincode: "", city: "", state: "", charge: "", freeAbove: "" }); }}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      {/* Bulk Import */}
      {showBulk && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Bulk Import (CSV format)</h3>
            <button onClick={() => setShowBulk(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-2">Format: pincode, city, state, charge, freeAbove (one per line)</p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"110001, New Delhi, Delhi, 50, 500\n400001, Mumbai, Maharashtra, 40, 600"}
            className="w-full h-32 rounded-xl border border-slate-200 p-3 text-sm font-mono outline-none focus:border-indigo-400"
          />
          <button onClick={onBulkImport} disabled={saving}
            className="mt-3 h-10 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
            {saving ? "Importing..." : "Import"}
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">{editId ? "Edit" : "Add"} Delivery Charge</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div>
              <label className="text-xs font-semibold text-slate-600">Pincode *</label>
              <input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="110001"
                maxLength={6}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="New Delhi"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="Delhi"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Charge (Rs) *</label>
              <input
                value={form.charge}
                onChange={(e) => setForm({ ...form, charge: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="50"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Free Above (Rs)</label>
              <input
                value={form.freeAbove}
                onChange={(e) => setForm({ ...form, freeAbove: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="500"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={onSave} disabled={saving}
              className="h-10 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
              {saving ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            <button onClick={resetForm}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Pincode</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Charge (Rs)</th>
                <th className="px-4 py-3">Free Above (Rs)</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                    No delivery charges configured yet. Click "Add" to set up pincode-based delivery charges.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="text-sm hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{c.pincode}</td>
                    <td className="px-4 py-3 text-slate-700">{c.city || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{c.state || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">Rs {c.charge}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {c.freeAbove > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          Free above Rs {c.freeAbove}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)}
                          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                          Edit
                        </button>
                        <button onClick={() => onDelete(c._id)} disabled={deleting === c._id}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
