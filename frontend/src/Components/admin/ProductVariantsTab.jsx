import React, { useEffect, useState } from "react";
import { variantApi } from "../../api/variant.api";

const emptyForm = {
  size: "",
  color: "",
  sku: "",
  price: "",
  stock: "",
  image: "",
  isActive: true,
};

export default function ProductVariantsTab({ productId }) {
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await variantApi.listByProduct(productId);
      setVariants(res.data?.variants ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const startEdit = (v) => {
    setEditingId(v._id);
    setForm({
      size: v.size || "",
      color: v.color || "",
      sku: v.sku || "",
      price: v.price ?? "",
      stock: v.stock ?? "",
      image: v.image || "",
      isActive: !!v.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      size: form.size,
      color: form.color,
      sku: form.sku || undefined,
      price: form.price === "" ? undefined : Number(form.price),
      stock: form.stock === "" ? 0 : Number(form.stock),
      image: form.image || undefined,
      isActive: form.isActive,
    };

    if (!payload.size?.trim() || !payload.color?.trim()) {
      alert("Size & Color required");
      return;
    }

    if (editingId) {
      await variantApi.update(editingId, payload);
    } else {
      await variantApi.create(productId, payload);
    }

    cancelEdit();
    load();
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this variant?");
    if (!ok) return;
    await variantApi.remove(id);
    load();
  };

  const onToggle = async (id) => {
    await variantApi.toggleActive(id);
    load();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Variants</h3>
          <p className="mt-1 text-sm text-slate-400">
            Add variants like size/color, price, stock and active status.
          </p>
        </div>
      </div>

      {/* form */}
      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
        <input
          value={form.size}
          onChange={(e) => setForm((s) => ({ ...s, size: e.target.value }))}
          placeholder="Size (M / L / XL)"
          className="md:col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
        />
        <input
          value={form.color}
          onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))}
          placeholder="Color (Black)"
          className="md:col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
        />
        <input
          value={form.sku}
          onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
          placeholder="SKU (optional)"
          className="md:col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
        />
        <input
          value={form.price}
          onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
          placeholder="Price"
          type="number"
          className="md:col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
        />
        <input
          value={form.stock}
          onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
          placeholder="Stock"
          type="number"
          className="md:col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
        />

        <div className="md:col-span-1 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
            />
            Active
          </label>
        </div>

        <input
          value={form.image}
          onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
          placeholder="Image URL (optional)"
          className="md:col-span-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
        />

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/15"
          >
            {editingId ? "Update Variant" : "Add Variant"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* list */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/20 text-slate-300">
              <tr>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : variants.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={7}>
                    No variants added yet.
                  </td>
                </tr>
              ) : (
                variants.map((v) => (
                  <tr key={v._id} className="hover:bg-white/5">
                    <td className="px-4 py-3">{v.size}</td>
                    <td className="px-4 py-3">{v.color}</td>
                    <td className="px-4 py-3">{v.sku || "—"}</td>
                    <td className="px-4 py-3">{v.price ?? "—"}</td>
                    <td className="px-4 py-3">{v.stock ?? 0}</td>
                    <td className="px-4 py-3">{v.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onToggle(v._id)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                        >
                          {v.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => startEdit(v)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(v._id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                        >
                          Delete
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