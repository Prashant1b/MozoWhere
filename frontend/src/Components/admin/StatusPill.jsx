import React from "react";

const map = {
  pending: "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StatusPill({ status }) {
  const cls = map[status] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      {String(status || "pending").toUpperCase()}
    </span>
  );
}
