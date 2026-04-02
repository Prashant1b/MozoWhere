import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ShoppingCart, CheckCircle2, Package, Shirt, Ruler, Layers } from "lucide-react";
import ShirtTintOverlay from "./ShirtTintOverlay";

export default function PreviewStep({
  mockups, selectedColor, selectedSize, selectedFabric,
  showFabric = true, designBySide,
  onBack, onAddToBag, addingCustom, addMessage,
}) {
  const [side, setSide] = useState("front");
  const printW = 280, printH = 330;
  const [scaleToFit, setScaleToFit] = useState(1);
  const boxRef = useRef(null);
  const areaRef = useRef(null);

  const items = useMemo(() => designBySide?.[side] || [], [designBySide, side]);
  const totalElements = (designBySide?.front?.length || 0) + (designBySide?.back?.length || 0);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => setScaleToFit((el.clientWidth || printW) / printW);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [printW]);

  const isSuccess = addMessage?.toLowerCase().includes("added");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Preview */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Final Preview</h2>
            <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setSide("front")}
                className={["px-4 py-1.5 text-xs font-semibold transition", side === "front" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"].join(" ")}
              >
                Front
              </button>
              <button
                onClick={() => setSide("back")}
                className={["px-4 py-1.5 text-xs font-semibold transition", side === "back" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"].join(" ")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm">
            <div className="relative aspect-[3/4] w-full">
              <ShirtTintOverlay
                hex={selectedColor?.hex}
                imageUrl={mockups[side]}
                imgClass="absolute inset-0 h-full w-full select-none object-contain"
                alt="preview"
              />

              <div
                ref={areaRef}
                className="absolute left-1/2 top-[22%] z-20 -translate-x-1/2 overflow-hidden"
                style={{ width: "42%", aspectRatio: "280 / 330" }}
              >
                <div
                  ref={boxRef}
                  className="relative mx-auto"
                  style={{ width: printW, height: printH, transform: `scale(${scaleToFit || 1})`, transformOrigin: "top center" }}
                >
                  {items.map((it) => (
                    <div key={it.id} className="absolute" style={{ left: it.x, top: it.y, width: it.w, height: it.h }}>
                      <div className="h-full w-full" style={{ transform: `rotate(${it.rot || 0}deg)`, transformOrigin: "center" }}>
                        {it.type === "image" ? (
                          <img src={it.src} alt="design" className="pointer-events-none h-full w-full select-none object-contain" draggable={false} />
                        ) : (
                          <div className="flex h-full w-full select-none items-start overflow-hidden"
                            style={{ fontSize: it.fontSize || 42, fontWeight: it.fontWeight || 600, fontFamily: it.fontFamily || "sans-serif", color: it.fontColor || "#111", textAlign: it.textAlign || "left", lineHeight: 1.05 }}>
                            {it.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Order Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200">
                  <Shirt size={16} className="text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase text-slate-400">Color</div>
                  <div className="flex items-center gap-1.5">
                    {selectedColor?.hex && <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: selectedColor.hex }} />}
                    <span className="text-sm font-semibold text-slate-800">{selectedColor?.name || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200">
                  <Ruler size={16} className="text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase text-slate-400">Size</div>
                  <span className="text-sm font-semibold text-slate-800">{selectedSize?.id || "N/A"}</span>
                </div>
              </div>

              {showFabric && (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200">
                    <Layers size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium uppercase text-slate-400">Fabric</div>
                    <span className="text-sm font-semibold text-slate-800">{selectedFabric?.name || "Standard"}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-indigo-200">
                  <span className="text-sm font-bold text-indigo-600">{totalElements}</span>
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase text-indigo-400">Design Elements</div>
                  <span className="text-sm font-semibold text-indigo-700">
                    {totalElements === 0 ? "No elements" : `${totalElements} element${totalElements > 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <button
              onClick={onAddToBag}
              disabled={addingCustom}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition active:scale-[0.98] disabled:opacity-60"
            >
              <ShoppingCart size={18} />
              {addingCustom ? "Adding to Cart..." : "Add to Cart"}
            </button>

            <button
              onClick={onBack}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={14} /> Back to Editor
            </button>

            {addMessage && (
              <div className={[
                "flex items-center gap-2 rounded-xl p-3 text-xs font-medium",
                isSuccess ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200",
              ].join(" ")}>
                {isSuccess && <CheckCircle2 size={16} />}
                {addMessage}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
