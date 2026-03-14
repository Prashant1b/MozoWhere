import { useMemo, useState } from "react";
import { X, ImageIcon } from "lucide-react";

export default function GalleryModal({ open, onClose, tabs, itemsByTab, onPick }) {
  const [tab, setTab] = useState(tabs?.[0]?.id || "worldcup");
  const items = useMemo(() => itemsByTab?.[tab] || [], [itemsByTab, tab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: "fadeIn 200ms ease-out" }} onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ animation: "slideUp 250ms ease-out" }}>
        <button onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition">
          <X size={16} />
        </button>

        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Design Gallery</h3>
          </div>
          <p className="text-xs text-slate-500">Pick a trending design to add to your product</p>

          {/* Tab pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={[
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                  tab === t.id
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50",
                ].join(" ")}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-4 grid grid-cols-3 gap-3 overflow-y-auto max-h-[50vh] pr-1 sm:grid-cols-4">
            {items.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-slate-400">No designs in this category yet.</div>
            )}
            {items.map((it) => (
              <button key={it.id} onClick={() => onPick(it)}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-indigo-300 hover:shadow-md" title={it.title}>
                <img src={it.src} alt={it.title} className="h-20 w-full object-contain transition group-hover:scale-105" />
                {it.title && <div className="mt-1.5 truncate text-[10px] font-medium text-slate-500 group-hover:text-indigo-600">{it.title}</div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
