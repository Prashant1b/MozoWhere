import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "../api/orders.api";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function stepIndex(status) {
  const s = String(status || "").toLowerCase();
  const i = STEPS.indexOf(s);
  return i >= 0 ? i : 0;
}

function chipClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "shipped") return "bg-blue-50 text-blue-700";
  if (s === "processing") return "bg-violet-50 text-violet-700";
  if (s === "confirmed") return "bg-teal-50 text-teal-700";
  if (s === "cancelled") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

function itemThumb(it) {
  if (!it) return "";
  if (it.type === "custom") {
    const p = it?.customSnapshot?.preview || {};
    return p.front || p.back || it.image || "";
  }
  return it.image || "";
}

export default function TrackOrdersPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await ordersApi.myOrders();
      setOrders(res.data?.orders || []);
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/login", { state: { from: "/orders/track" } });
        return;
      }
      setErr(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const s = String(o?.orderStatus || "").toLowerCase();
      return s !== "delivered";
    });
  }, [orders]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Track Orders</h1>
          <p className="text-sm text-gray-600">Showing all orders that are not delivered yet.</p>
        </div>
        <button onClick={load} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {err ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading track details...</div>
      ) : activeOrders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          No active order to track. All your orders are delivered.
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((o) => {
            const status = String(o?.orderStatus || "pending").toLowerCase();
            const currentStep = stepIndex(status);
            const items = Array.isArray(o?.items) ? o.items : [];
            const thumb = itemThumb(items[0]);

            return (
              <div key={o._id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Order #{o._id}</div>
                    <div className="text-xs text-gray-500">
                      Placed: {o?.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chipClass(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {STEPS.map((s, i) => {
                    const done = i <= currentStep;
                    return (
                      <div key={s} className="text-center">
                        <div className={`mx-auto h-2 rounded-full ${done ? "bg-black" : "bg-gray-200"}`} />
                        <div className={`mt-1 text-[11px] font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>
                          {s}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {thumb ? <img src={thumb} alt="item" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{items[0]?.title || "Order Item"}</div>
                    <div className="text-xs text-gray-600">
                      {items.length} item(s) | Total: Rs {Number(o?.totalAmount || 0)}
                    </div>
                  </div>
                  <button
                    onClick={() => nav("/orders")}
                    className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
