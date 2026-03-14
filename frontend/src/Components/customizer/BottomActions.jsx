import { Type, Camera, ImageIcon, ArrowRight, ShoppingCart } from "lucide-react";

export default function BottomActions({
  mode = "edit", onAddText, onUpload, onOpenGallery, onSave, onNext, onAddToBag, addingCustom,
}) {
  return (
    <div className="w-full rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      {mode === "edit" ? (
        <>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <button onClick={onAddText} className="flex flex-col items-center gap-1 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                <Type size={18} className="text-indigo-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Text</span>
            </button>
            <button onClick={onUpload} className="flex flex-col items-center gap-1 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                <Camera size={18} className="text-emerald-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Upload</span>
            </button>
            <button onClick={onOpenGallery} className="flex flex-col items-center gap-1 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                <ImageIcon size={18} className="text-purple-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">Gallery</span>
            </button>
          </div>

          <div className="border-t border-slate-100 p-3">
            <button onClick={onNext}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 active:scale-[0.98] transition">
              Preview <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="p-3">
          <button onClick={onAddToBag} disabled={addingCustom}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-extrabold text-white shadow-lg disabled:opacity-60 transition">
            <ShoppingCart size={18} />
            {addingCustom ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
