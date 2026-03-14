import React, { useEffect, useState } from "react";
import { couponApi } from "../../api/coupon.api";
import { BadgePercent, Plus, Trash2, X } from "lucide-react";

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function AdminCouponsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [value, setValue] = useState("");
  const [minCartAmount, setMinCartAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [allowMultipleUse, setAllowMultipleUse] = useState(false);
  const [perUserLimit, setPerUserLimit] = useState("2");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const res = await couponApi.list();
      setCoupons(res.data?.coupons || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load coupons");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setCode(""); setDiscountType("percent"); setValue(""); setMinCartAmount(""); setMaxDiscount("");
    setAllowMultipleUse(false); setPerUserLimit("2"); setExpiryDate(""); setIsActive(true); setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = {
        code, discountType, value: Number(value),
        minCartAmount: minCartAmount === "" ? 0 : Number(minCartAmount),
        perUserLimit: allowMultipleUse ? Math.max(2, Number(perUserLimit) || 2) : 1,
        expiryDate, isActive,
      };
      if (discountType === "percent" && maxDiscount !== "") payload.maxDiscount = Number(maxDiscount);
      const res = await couponApi.create(payload);
      const created = res.data?.coupon;
      setCoupons((prev) => (created ? [created, ...prev] : prev));
      resetForm();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create coupon");
    } finally { setSaving(false); }
  };

  const onDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon: ${coupon.code}?`)) return;
    try {
      await couponApi.remove(coupon._id);
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete coupon");
    }
  };

  const inputCls = "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-pink-600 shrink-0">
              <BadgePercent className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Coupons</h1>
              <p className="text-xs text-slate-500">{coupons.length} coupons</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-1.5 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">{showForm ? "Cancel" : "Create"}</span>
          </button>
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">New Coupon</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code (e.g. WELCOME20)" className={inputCls} />
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={inputCls}>
              <option value="percent">Percent</option>
              <option value="flat">Flat</option>
            </select>
            <input required type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} placeholder={discountType === "percent" ? "Discount %" : "Flat Rs"} className={inputCls} />
            <input type="number" min="0" value={minCartAmount} onChange={(e) => setMinCartAmount(e.target.value)} placeholder="Min cart amount" className={inputCls} />
            <input type="number" min="0" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="Max discount (% only)" disabled={discountType !== "percent"} className={`${inputCls} disabled:bg-slate-100`} />
            <input required type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputCls} />
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <input type="checkbox" checked={allowMultipleUse} onChange={(e) => setAllowMultipleUse(e.target.checked)} className="accent-indigo-600" /> Multi-use
            </label>
            <input type="number" min="2" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} disabled={!allowMultipleUse} placeholder="Per-user limit" className={`${inputCls} disabled:bg-slate-100`} />
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-indigo-600" /> Active
            </label>
            <button disabled={saving} className="h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition sm:col-span-2 lg:col-span-1">
              {saving ? "Saving..." : "Create Coupon"}
            </button>
          </form>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs uppercase text-slate-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min Cart</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Per User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={8}>Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={8}>No coupons.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c._id} className="text-sm hover:bg-slate-50/50">
                <td className="px-4 py-3 font-bold text-slate-900 font-mono">{c.code}</td>
                <td className="px-4 py-3 text-slate-600 capitalize">{c.discountType}</td>
                <td className="px-4 py-3 text-slate-700">{c.discountType === "percent" ? `${c.value}%` : `Rs ${c.value}`}</td>
                <td className="px-4 py-3 text-slate-600">Rs {c.minCartAmount || 0}</td>
                <td className="px-4 py-3 text-slate-600">{toInputDate(c.expiryDate) || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{Number(c?.perUserLimit ?? 1) === 0 ? "Unlimited" : `${Number(c?.perUserLimit ?? 1)}x`}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onDelete(c)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={14} />
                  </button>
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
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">No coupons.</div>
        ) : coupons.map((c) => (
          <div key={c._id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono font-bold text-sm text-slate-900">{c.code}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {c.discountType === "percent" ? `${c.value}% off` : `Rs ${c.value} off`}
                  {c.minCartAmount > 0 && ` · Min Rs ${c.minCartAmount}`}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[10px] text-slate-400">Exp: {toInputDate(c.expiryDate) || "-"}</span>
                </div>
              </div>
              <button onClick={() => onDelete(c)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
