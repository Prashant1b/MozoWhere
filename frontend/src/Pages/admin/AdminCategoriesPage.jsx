import React, { useEffect, useState } from "react";
import { categoryApi } from "../../api/category.api";
import { Folder, Pencil, Trash2, Plus, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [isTrending, setIsTrending] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await categoryApi.list();
      setCategories(res.data?.categories || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(""); setSlug(""); setImage(""); setIsTrending(true); setSortOrder(0); setEditing(null); setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const payload = { name, slug, image, isTrending, sortOrder: Number(sortOrder || 0) };
    try {
      if (editing) {
        const res = await categoryApi.update(editing._id, payload);
        const updated = res.data?.category;
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const res = await categoryApi.create(payload);
        const created = res.data?.category;
        setCategories((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (e) {
      setErr(e?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (cat) => {
    setEditing(cat);
    setName(cat.name || ""); setSlug(cat.slug || ""); setImage(cat.image || "");
    setIsTrending(cat.isTrending !== false); setSortOrder(Number(cat.sortOrder || 0));
    setShowForm(true);
  };

  const onDelete = async (cat) => {
    if (!window.confirm(`Delete category: ${cat.name}?`)) return;
    try {
      await categoryApi.remove(cat._id);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Categories</h1>
              <p className="text-xs text-slate-500">{categories.length} categories</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-1.5 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">{showForm ? "Cancel" : "Add"}</span>
          </button>
        </div>

        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">{editing ? "Edit Category" : "New Category"}</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" required
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (optional)"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" />
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="Sort Order"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" />
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="accent-indigo-600" />
              Show in Trending
            </label>
            <button disabled={saving} className="h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs uppercase text-slate-500">
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Trending</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>No categories.</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat._id} className="text-sm hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-slate-100" />
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{cat.name}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{cat.slug}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cat.isTrending !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {cat.isTrending !== false ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{cat.sortOrder || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => onEdit(cat)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                      <Pencil size={14} className="text-slate-600" />
                    </button>
                    <button onClick={() => onDelete(cat)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">No categories.</div>
        ) : categories.map((cat) => (
          <div key={cat._id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900">{cat.name}</div>
                <div className="text-[11px] text-slate-500">{cat.slug}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cat.isTrending !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {cat.isTrending !== false ? "Trending" : "Hidden"}
                  </span>
                  <span className="text-[10px] text-slate-400">Order: {cat.sortOrder || 0}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => onEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => onDelete(cat)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
