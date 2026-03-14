import { Type, ImageIcon, Trash2, ChevronUp, ChevronDown, Layers } from "lucide-react";

export default function LayersPanel({ items, activeId, setActiveId, onDelete, onReorder }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
        <Layers size={13} />
        Layers ({items.length})
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">
          No elements yet
        </div>
      )}

      {[...items].reverse().map((it, reversedIdx) => {
        const realIdx = items.length - 1 - reversedIdx;
        const active = it.id === activeId;

        return (
          <div key={it.id} onClick={() => setActiveId(it.id)}
            className={[
              "flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition-all",
              active ? "border-indigo-400 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50",
            ].join(" ")}>
            <div className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", active ? "bg-indigo-100" : "bg-slate-100"].join(" ")}>
              {it.type === "text"
                ? <Type size={12} className={active ? "text-indigo-600" : "text-slate-500"} />
                : <ImageIcon size={12} className={active ? "text-indigo-600" : "text-slate-500"} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-semibold text-slate-700">
                {it.type === "text" ? (it.text || "Text").slice(0, 18) : "Image"}
              </div>
              <div className="text-[9px] text-slate-400">
                {it.type === "text" ? `${Math.round(it.fontSize || 42)}px` : `${Math.round(it.w)}x${Math.round(it.h)}`}
              </div>
            </div>

            <div className="flex flex-col">
              <button onClick={(e) => { e.stopPropagation(); onReorder(realIdx, realIdx + 1); }}
                disabled={realIdx >= items.length - 1}
                className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20" title="Move up">
                <ChevronUp size={11} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onReorder(realIdx, realIdx - 1); }}
                disabled={realIdx <= 0}
                className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20" title="Move down">
                <ChevronDown size={11} />
              </button>
            </div>

            <button onClick={(e) => { e.stopPropagation(); onDelete(it.id); }}
              className="p-1 text-slate-300 hover:text-red-500 transition" title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
