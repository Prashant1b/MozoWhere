import { useMemo } from "react";
import { ArrowRight, Check, Shirt, Ruler, Layers } from "lucide-react";
import ShirtTintOverlay from "./ShirtTintOverlay";

export default function PickColorSize({
  previewImage, productTitle, productType, basePrice,
  colors, sizes, fabrics,
  selectedColor, setSelectedColor,
  selectedSize, setSelectedSize,
  selectedFabric, setSelectedFabric,
  onNext,
}) {
  const canNext = useMemo(() => {
    const fabricOk = !fabrics?.length || Boolean(selectedFabric?._id || selectedFabric?.id || selectedFabric?.name);
    const sizeOk = !sizes?.length || Boolean(selectedSize?.id);
    return Boolean(selectedColor) && sizeOk && fabricOk;
  }, [selectedColor, selectedSize, sizes, fabrics, selectedFabric]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Preview Card */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-slate-50 to-slate-100">
              {previewImage ? (
                <ShirtTintOverlay
                  hex={selectedColor?.hex}
                  imageUrl={previewImage}
                  imgClass="h-full w-full object-contain p-6"
                  alt={productTitle || "Template"}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  <Shirt size={48} className="text-slate-200" />
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{productType || "Custom Product"}</div>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">{productTitle || "Product Template"}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">Rs {Number(basePrice || 0)}</span>
                <span className="text-xs text-slate-400">starting price</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options Panel */}
        <div className="space-y-5">
          {/* Color Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Shirt size={16} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Color</h3>
                {selectedColor && (
                  <p className="text-xs text-slate-500">Selected: <span className="font-medium text-slate-700">{selectedColor.name}</span></p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {colors.map((c) => {
                const active = selectedColor?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={[
                      "group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all",
                      active ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100" : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                    title={c.name}
                  >
                    <div className="relative h-10 w-10 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: c.hex }}>
                      {active && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                          <Check size={16} className="text-white drop-shadow" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className={["text-[10px] font-medium leading-tight text-center", active ? "text-indigo-700" : "text-slate-500"].join(" ")}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <Ruler size={16} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Size</h3>
            </div>
            {!sizes?.length ? (
              <p className="text-sm text-slate-400">Size is not required for this product.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const disabled = Number.isFinite(s.stock) && s.stock <= 0;
                  const active = selectedSize?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      disabled={disabled}
                      onClick={() => { if (!disabled) setSelectedSize((prev) => (prev?.id === s.id ? null : s)); }}
                      className={[
                        "min-w-[52px] rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all",
                        disabled
                          ? "cursor-not-allowed border-slate-100 text-slate-300"
                          : active
                          ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50",
                      ].join(" ")}
                    >
                      {s.id}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fabric Selection */}
          {!!fabrics?.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <Layers size={16} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Fabric</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {fabrics.map((f) => {
                  const key = f?._id || f?.id || f?.name;
                  const active = (selectedFabric?._id || selectedFabric?.id || selectedFabric?.name) === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedFabric(f)}
                      className={[
                        "rounded-xl border-2 px-4 py-3 text-left transition-all",
                        active
                          ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                          : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className={["text-sm font-semibold", active ? "text-indigo-700" : "text-slate-800"].join(" ")}>{f?.name || "Fabric"}</div>
                      <div className={["text-xs mt-0.5", active ? "text-indigo-500" : "text-slate-400"].join(" ")}>
                        {Number(f?.extraPrice || 0) > 0 ? `+ Rs ${Number(f.extraPrice)}` : "No extra charge"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary & Continue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="font-medium">Your selection:</span>
              {selectedColor && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: selectedColor.hex }} />
                  {selectedColor.name}
                </span>
              )}
              {selectedSize && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{selectedSize.id}</span>
              )}
              {selectedFabric && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{selectedFabric.name}</span>
              )}
            </div>

            <button
              onClick={onNext}
              disabled={!canNext}
              className={[
                "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all",
                canNext
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-[0.98]"
                  : "cursor-not-allowed bg-slate-100 text-slate-400",
              ].join(" ")}
            >
              Continue to Design Studio <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
