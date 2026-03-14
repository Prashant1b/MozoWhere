import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "../api/orders.api";

const COLOR_HEX_MAP = {
  white: "#FFFFFF",
  black: "#111827",
  navy: "#1e3a8a",
  blue: "#2563eb",
  sky: "#7dd3fc",
  lavender: "#c4b5fd",
  mint: "#6ee7b7",
  sand: "#d6b48a",
  red: "#ef4444",
  yellow: "#facc15",
  green: "#22c55e",
  gray: "#9ca3af",
  grey: "#9ca3af",
  maroon: "#7f1d1d",
  beige: "#d6d3c8",
  orange: "#f97316",
  pink: "#ec4899",
  purple: "#8b5cf6",
  brown: "#92400e",
};

function colorToHex(name) {
  const key = String(name || "").trim().toLowerCase();
  return COLOR_HEX_MAP[key] || "#e5e7eb";
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-700";
  if (s === "cancelled") return "bg-rose-50 text-rose-700";
  if (s === "shipped") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

function payClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "bg-emerald-50 text-emerald-700";
  if (s === "failed") return "bg-rose-50 text-rose-700";
  if (s === "refunded") return "bg-indigo-50 text-indigo-700";
  return "bg-amber-50 text-amber-700";
}

function itemImage(item) {
  if (item?.image) return item.image;
  return item?.customSnapshot?.preview?.front || item?.customSnapshot?.preview?.back || "";
}

function getPaymentMethod(order) {
  if (order?.paymentMethod === "cod" || order?.paymentMethod === "online") return order.paymentMethod;
  if (order?.razorpayPaymentId || order?.razorpayOrderId) return "online";
  if (String(order?.paymentStatus || "").toLowerCase() === "paid") return "online";
  return "cod";
}

function CustomOrderPreview({ item }) {
  const snap = item?.customSnapshot || {};
  const layersAll = Array.isArray(snap?.layers) ? snap.layers : [];
  const count = (s) => layersAll.filter((l) => l?.side === s).length;
  const side = count("front") >= count("back") ? "front" : "back";
  const finalPreview = snap?.preview?.[side] || snap?.preview?.front || snap?.preview?.back || "";
  if (finalPreview) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-md bg-gray-100">
        <img src={finalPreview} alt="custom" className="h-full w-full object-contain" />
      </div>
    );
  }

  const image = snap?.preview?.[side] || item?.image || "";
  const layers = layersAll.filter((l) => l?.side === side);
  const printW = 280;
  const printH = 330;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md bg-gray-100">
      {image ? <img src={image} alt="custom" className="absolute inset-0 h-full w-full object-contain p-1" /> : null}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{ backgroundColor: colorToHex(snap?.selected?.color || item?.color) }}
      />

      <div
        className="absolute left-1/2 top-[18%] -translate-x-1/2 overflow-hidden rounded-[2px]"
        style={{ width: "84%", maxWidth: printW, aspectRatio: "280 / 330" }}
      >
        <div className="relative h-full w-full border border-dashed border-black/20">
          {layers.map((it, idx) => {
            const left = ((Number(it?.x || 0) / printW) * 100).toFixed(2);
            const top = ((Number(it?.y || 0) / printH) * 100).toFixed(2);
            const width = ((Number(it?.w || 0) / printW) * 100).toFixed(2);
            const height = ((Number(it?.h || 0) / printH) * 100).toFixed(2);
            return (
              <div
                key={idx}
                className="absolute"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  transform: `rotate(${Number(it?.rotate || 0)}deg)`,
                  transformOrigin: "center",
                }}
              >
                {it?.kind === "image" ? (
                  <img src={it?.imageUrl} alt="layer" className="h-full w-full object-contain" />
                ) : (
                  <div
                    className="line-clamp-2 w-full font-semibold text-black"
                    style={{ fontSize: `${Math.max(9, Math.round(Number(it?.fontSize || 32) * 0.22))}px`, lineHeight: 1.05 }}
                  >
                    {it?.text || ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = async (p = 1) => {
    setLoading(true);
    setErr("");
    try {
      const res = await ordersApi.myOrders(p, limit);
      setOrders(res.data?.orders || []);
      setTotal(res.data?.total || 0);
      setPage(p);
      setExpandedId(null);
      setExpandedOrder(null);
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/login", { state: { from: "/orders" } });
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

  const toggle = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedOrder(null);
      return;
    }
    setExpandedId(id);
    setExpandedOrder(null);
    setDetailLoading(true);
    try {
      const res = await ordersApi.getById(id);
      setExpandedOrder(res.data?.order || null);
    } catch {
      setExpandedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        <button onClick={() => load(page)} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {err ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">No orders found.</div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((o) => {
              const created = o?.createdAt ? new Date(o.createdAt).toLocaleString() : "-";
              const items = Array.isArray(o?.items) ? o.items : [];
              const isOpen = expandedId === o._id;
              const method = getPaymentMethod(o);
              const detail = isOpen ? expandedOrder : null;
              const detailItems = detail ? (Array.isArray(detail.items) ? detail.items : []) : items;
              return (
                <div key={o._id} className="rounded-xl border border-gray-200 bg-white">
                  <button
                    onClick={() => toggle(o._id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900">Order #{o._id}</div>
                      <div className="mt-1 text-xs text-gray-500">Placed: {created}</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">Total: Rs {Number(o?.totalAmount || 0)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(o?.orderStatus)}`}>
                        {o?.orderStatus || "pending"}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${payClass(o?.paymentStatus)}`}>
                        Payment: {method === "cod" ? "COD" : o?.paymentStatus || "pending"}
                      </span>
                      <span className="text-xs font-semibold text-gray-600">{isOpen ? "Hide" : "View"}</span>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-gray-100 px-4 py-4">
                      {detailLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-300 border-t-black" />
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 text-sm font-bold text-gray-900">Items ({detailItems.length})</div>
                          <div className="space-y-2">
                            {detailItems.map((it, idx) => (
                              <div key={`${o._id}-${idx}`} className="flex gap-3 rounded-lg border border-gray-200 p-2">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                  {it?.type === "custom" ? (
                                    <CustomOrderPreview item={it} />
                                  ) : itemImage(it) ? (
                                    <img src={itemImage(it)} alt={it?.title || "item"} className="h-full w-full object-cover" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-semibold text-gray-900">{it?.title || "Item"}</div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    {it?.size ? `Size: ${it.size}` : ""}
                                    {it?.color ? `${it?.size ? " | " : ""}Color: ${it.color}` : ""}
                                    {it?.fabric ? `${it?.size || it?.color ? " | " : ""}Fabric: ${it.fabric}` : ""}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-700">Qty: {it?.quantity} | Price: Rs {it?.unitPrice}</div>
                                  {it?.type === "custom" ? (
                                    <div className="mt-1 text-xs text-emerald-700">
                                      Customized item | Layers: {it?.customSnapshot?.layers?.length || 0}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</div>
                              <div className="mt-1 text-sm text-gray-800">Method: {method === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}</div>
                              <div className="mt-1 text-sm text-gray-800">Status: {method === "cod" ? "Pay on Delivery" : o?.paymentStatus || "pending"}</div>
                              {o?.razorpayPaymentId ? <div className="mt-1 text-xs text-gray-600">Razorpay Payment ID: {o.razorpayPaymentId}</div> : null}
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Shipping Address</div>
                              <div className="mt-1 text-sm text-gray-800">{o?.shippingAddress?.name || "-"}</div>
                              <div className="text-xs text-gray-600">{o?.shippingAddress?.phone || "-"}</div>
                              <div className="mt-1 text-xs text-gray-700">
                                {[o?.shippingAddress?.addressLine, o?.shippingAddress?.city, o?.shippingAddress?.state, o?.shippingAddress?.pincode]
                                  .filter(Boolean)
                                  .join(", ") || "-"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
