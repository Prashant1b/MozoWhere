import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/admin.api";
import StatusPill from "../../Components/admin/StatusPill";
import AdminOrderDetailModal from "../../Components/admin/AdminOrderDetailModal";
import { Eye, Search, RefreshCw, Package } from "lucide-react";

const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function getItemThumb(it) {
  if (!it) return "";
  if (it.type === "custom") {
    const fromPreview = it?.customSnapshot?.preview?.front || it?.customSnapshot?.preview?.back;
    const fromLayer =
      Array.isArray(it?.customSnapshot?.layers)
        ? it.customSnapshot.layers.find((l) => l?.kind === "image" && l?.imageUrl)?.imageUrl
        : "";
    return fromPreview || fromLayer || it?.image || "";
  }
  return it?.image || "";
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await adminApi.listOrders();
      setOrders(res.data?.orders || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) => {
      const id = String(o?._id || "").toLowerCase();
      const email = String(o?.user?.emailid || o?.user?.email || "").toLowerCase();
      const status = String(o?.orderStatus || "").toLowerCase();
      return id.includes(term) || email.includes(term) || status.includes(term);
    });
  }, [orders, q]);

  const onChangeStatus = async (id, nextStatus) => {
    setErr("");
    setSavingId(id);
    try {
      const res = await adminApi.updateOrderStatus(id, nextStatus);
      const updated = res.data?.order;
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...updated } : o)));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Orders</h1>
              <p className="text-xs text-slate-500">{orders.length} total orders</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search orders..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 sm:w-[260px]"
              />
            </div>
            <button
              onClick={load}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <OrderRow
                    key={o._id}
                    order={o}
                    saving={savingId === o._id}
                    onChangeStatus={onChangeStatus}
                    onViewDetail={() => setDetailOrder(o)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            No orders found.
          </div>
        ) : (
          filtered.map((o) => (
            <MobileOrderCard
              key={o._id}
              order={o}
              saving={savingId === o._id}
              onChangeStatus={onChangeStatus}
              onViewDetail={() => setDetailOrder(o)}
            />
          ))
        )}
      </div>

      {detailOrder && (
        <AdminOrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </div>
  );
}

/* Desktop table row */
function OrderRow({ order, saving, onChangeStatus, onViewDetail }) {
  const [next, setNext] = useState(order?.orderStatus || "pending");

  useEffect(() => {
    setNext(order?.orderStatus || "pending");
  }, [order?.orderStatus]);

  const created = order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "-";
  const userEmail = order?.user?.emailid || order?.user?.email || "-";
  const items = Array.isArray(order?.items) ? order.items : [];
  const customCount = items.filter((i) => i?.type === "custom").length;
  const firstThumb = getItemThumb(items[0]);

  return (
    <tr className="text-sm hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-900 font-mono text-xs">#{order?._id?.slice(-8)}</div>
        <div className="text-xs text-slate-500">Rs {Number(order?.totalAmount || 0)}</div>
        <button
          onClick={onViewDetail}
          className="mt-1.5 flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          <Eye size={12} /> Details
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="text-slate-800 text-xs truncate max-w-[180px]">{userEmail}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {firstThumb ? (
            <img src={firstThumb} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-contain bg-slate-50" />
          ) : null}
          <div>
            <div className="text-slate-800 text-xs">{items.length} item(s)</div>
            {customCount > 0 && (
              <span className="inline-block mt-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {customCount} custom
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">{created}</td>
      <td className="px-4 py-3"><StatusPill status={order?.orderStatus} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none focus:border-indigo-400"
            disabled={saving}
          >
            {allowed.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => onChangeStatus(order._id, next)}
            disabled={saving || next === order?.orderStatus}
            className="h-9 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* Mobile card */
function MobileOrderCard({ order, saving, onChangeStatus, onViewDetail }) {
  const [next, setNext] = useState(order?.orderStatus || "pending");
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    setNext(order?.orderStatus || "pending");
  }, [order?.orderStatus]);

  const created = order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "-";
  const userEmail = order?.user?.emailid || order?.user?.email || "-";
  const items = Array.isArray(order?.items) ? order.items : [];
  const customCount = items.filter((i) => i?.type === "custom").length;
  const firstThumb = getItemThumb(items[0]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Main info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {firstThumb ? (
              <img src={firstThumb} alt="" className="h-12 w-12 rounded-xl border border-slate-200 object-contain bg-slate-50" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100">
                <Package className="h-5 w-5 text-slate-400" />
              </div>
            )}
            <div>
              <div className="font-mono text-xs font-bold text-slate-800">#{order._id?.slice(-8)}</div>
              <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{userEmail}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Rs {Number(order.totalAmount || 0)}</span>
                <span className="text-[10px] text-slate-400">{items.length} item(s)</span>
                {customCount > 0 && (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    {customCount} custom
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <StatusPill status={order.orderStatus} />
            <div className="mt-1 text-[10px] text-slate-400">{created}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-2">
        <button
          onClick={onViewDetail}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          <Eye size={14} /> View Details
        </button>
        <button
          onClick={() => setShowUpdate(!showUpdate)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
        >
          Update Status
        </button>
      </div>

      {/* Status update (expandable) */}
      {showUpdate && (
        <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-2">
          <select
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="flex-1 h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none"
            disabled={saving}
          >
            {allowed.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => { onChangeStatus(order._id, next); setShowUpdate(false); }}
            disabled={saving || next === order?.orderStatus}
            className="h-9 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
