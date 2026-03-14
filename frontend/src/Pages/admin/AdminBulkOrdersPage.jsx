import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/admin.api";
import { ClipboardList, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  processing: "bg-orange-100 text-orange-800",
  closed: "bg-green-100 text-green-800",
};

const PRODUCT_LABELS = { tshirt: "T-Shirt", hoodie: "Hoodie", cap: "Cap", jogger: "Jogger", polo: "Polo" };

export default function AdminBulkOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const res = await adminApi.listBulkOrders();
      setRows(res.data?.bulkOrders || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load bulk orders");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateBulkOrderStatus(id, status);
      setRows((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600 shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Bulk Orders</h1>
              <p className="text-xs text-slate-500">{rows.length} requests</p>
            </div>
          </div>
          <button onClick={load} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-400">No requests found.</div>
        ) : rows.map((r) => {
          const expanded = expandedId === r._id;
          return (
            <div key={r._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <button onClick={() => setExpandedId(expanded ? null : r._id)}
                className="w-full p-4 text-left hover:bg-slate-50 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{r.name}</span>
                    {r.company && <span className="ml-2 text-xs text-slate-500">({r.company})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[r.status] || "bg-slate-100 text-slate-600"}`}>
                      {r.status}
                    </span>
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
                  <span>{r.email}</span>
                  <span>{PRODUCT_LABELS[r.product] || r.product} · <b>{r.quantity} pcs</b> · Rs {Number(r?.pricing?.totalPrice || 0).toLocaleString("en-IN")}</span>
                  <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </button>

              {expanded && (
                <div className="border-t p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm">
                    <InfoItem label="Phone" value={r.phone || "-"} />
                    <InfoItem label="Email" value={r.email} />
                    <InfoItem label="Company" value={r.company || "-"} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
                    <InfoItem label="Print Placement" value={r.printPlacement || "front"} />
                    <InfoItem label="Colors" value={r.colors?.length ? r.colors.join(", ") : "N/A"} />
                    <InfoItem label="Delivery Date" value={r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString("en-IN") : "-"} />
                    <InfoItem label="Discount" value={`${r.pricing?.discountPercent || 0}%`} />
                  </div>

                  {r.sizeBreakdown?.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500">Size Breakdown</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {r.sizeBreakdown.map((s, i) => (
                          <span key={i} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold">{s.size}: {s.quantity}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.notes && (
                    <div>
                      <span className="text-xs text-slate-500">Notes</span>
                      <div className="mt-1 rounded-xl bg-slate-50 border p-3 text-sm text-slate-700 whitespace-pre-wrap">{r.notes}</div>
                    </div>
                  )}

                  {(r.images || []).length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500">Design Images ({r.images.length})</span>
                      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {r.images.map((im, idx) => (
                          <a key={idx} href={im.dataUrl} target="_blank" rel="noreferrer" download={im.name}
                            className="overflow-hidden rounded-xl border border-slate-200 hover:shadow-md transition">
                            <img src={im.dataUrl} alt={im.name || "design"} className="h-20 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-slate-500">Update Status</span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {["new", "contacted", "quoted", "processing", "closed"].map((s) => (
                        <button key={s} onClick={() => updateStatus(r._id, s)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                            r.status === s ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-slate-100 border-slate-200"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <span className="text-[11px] text-slate-400">{label}</span>
      <div className="font-semibold text-slate-800 text-xs truncate capitalize">{value}</div>
    </div>
  );
}
