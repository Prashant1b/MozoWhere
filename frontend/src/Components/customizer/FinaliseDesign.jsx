import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, ImageIcon, Trash2, ArrowUpToLine, ArrowDownToLine, Type, Undo2, Redo2, RotateCw, X, ArrowRight, ArrowLeft, MousePointerClick } from "lucide-react";
import BottomActions from "./BottomActions";
import GalleryModal from "./GalleryModal";
import TextPanel from "./TextPanel";
import LayersPanel from "./LayersPanel";
import ShirtTintOverlay from "./ShirtTintOverlay";

function uid() { return Math.random().toString(16).slice(2); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function clampItemInside(item, areaW, areaH) {
  const w = item.w ?? 0, h = item.h ?? 0;
  const x = clamp(item.x, Math.min(areaW - w, 0), Math.max(areaW - w, 0));
  const y = clamp(item.y, Math.min(areaH - h, 0), Math.max(areaH - h, 0));
  return { ...item, x, y };
}

function getLocalPoint(e, boxEl) {
  const r = boxEl.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function degFromPoints(cx, cy, px, py) {
  return (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ResizeHandle({ pos, onDown }) {
  const base = "absolute h-4 w-4 rounded-sm bg-white border-2 border-indigo-500 pointer-events-auto shadow-sm";
  const map = {
    tl: "left-[-8px] top-[-8px] cursor-nwse-resize",
    tr: "right-[-8px] top-[-8px] cursor-nesw-resize",
    bl: "left-[-8px] bottom-[-8px] cursor-nesw-resize",
    br: "right-[-8px] bottom-[-8px] cursor-nwse-resize",
    t: "left-1/2 top-[-8px] -translate-x-1/2 cursor-ns-resize",
    b: "left-1/2 bottom-[-8px] -translate-x-1/2 cursor-ns-resize",
    l: "left-[-8px] top-1/2 -translate-y-1/2 cursor-ew-resize",
    r: "right-[-8px] top-1/2 -translate-y-1/2 cursor-ew-resize",
  };
  return <div className={[base, map[pos]].join(" ")} onPointerDown={onDown} role="button" aria-label={`Resize ${pos}`} />;
}

export default function FinaliseDesign({
  mockups, galleryTabs, galleryItems,
  selectedColor, selectedSize, selectedFabric, showFabric = true,
  designBySide, setDesignBySide, onBack, onNext,
}) {
  const [side, setSide] = useState("front");
  const [openGallery, setOpenGallery] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [mobileTextOpen, setMobileTextOpen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const fileRef = useRef(null);
  const boxRef = useRef(null);
  const areaRef = useRef(null);
  const sessionRef = useRef(null);

  const printW = 280, printH = 330;
  const [scaleToFit, setScaleToFit] = useState(1);

  const items = useMemo(() => designBySide[side] || [], [designBySide, side]);
  const activeItem = useMemo(() => items.find((it) => it.id === activeId) || null, [items, activeId]);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => setScaleToFit((el.clientWidth || printW) / printW);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [printW]);

  // --- State helpers ---
  function setItems(updater) {
    setDesignBySide((prev) => {
      const next = { ...prev };
      next[side] = typeof updater === "function" ? updater(next[side] || []) : updater;
      return next;
    });
  }

  function setItemsWithHistory(updater) {
    setDesignBySide((prev) => {
      const curr = prev[side] || [];
      setUndoStack((stack) => [...stack.slice(-19), { side, items: curr }]);
      setRedoStack([]);
      const next = { ...prev };
      next[side] = typeof updater === "function" ? updater(curr) : updater;
      return next;
    });
  }

  function undo() {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, { side: last.side, items: designBySide[last.side] || [] }]);
    setUndoStack((stack) => stack.slice(0, -1));
    setDesignBySide((prev) => ({ ...prev, [last.side]: last.items }));
    setActiveId(null);
  }

  function redo() {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, { side: next.side, items: designBySide[next.side] || [] }]);
    setRedoStack((stack) => stack.slice(0, -1));
    setDesignBySide((prev) => ({ ...prev, [next.side]: next.items }));
    setActiveId(null);
  }

  function updateItem(id, patch) {
    setItems((curr) => curr.map((it) => it.id !== id ? it : clampItemInside({ ...it, ...patch }, printW, printH)));
  }

  function reorderItem(fromIdx, toIdx) {
    if (fromIdx === toIdx || toIdx < 0) return;
    setItemsWithHistory((curr) => {
      const copy = [...curr];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  }

  function deleteById(id) {
    setItemsWithHistory((c) => c.filter((x) => x.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function addText(config) {
    const it = clampItemInside({
      id: uid(), type: "text", text: config.text, x: 40, y: 40, w: 200, h: 80,
      fontSize: config.fontSize || 42, fontFamily: config.fontFamily || "sans-serif",
      fontColor: config.fontColor || "#111111", fontWeight: config.fontWeight || 600,
      textAlign: config.textAlign || "left", rot: 0,
    }, printW, printH);
    setItemsWithHistory((c) => [...c, it]);
    setActiveId(it.id);
  }

  function removeActive() {
    if (!activeId) return;
    setItemsWithHistory((c) => c.filter((x) => x.id !== activeId));
    setActiveId(null);
  }

  function onUploadClick() { fileRef.current?.click(); }

  async function onUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    const it = clampItemInside(
      { id: uid(), type: "image", src: url, x: 40, y: 50, w: 170, h: 170, rot: 0 },
      printW, printH
    );
    setItemsWithHistory((c) => [...c, it]);
    setActiveId(it.id);
    e.target.value = "";
  }

  function pickGalleryItem(it) {
    const newItem = clampItemInside(
      { id: uid(), type: "image", src: it.src, x: 40, y: 50, w: 170, h: 170, rot: 0 },
      printW, printH
    );
    setItemsWithHistory((c) => [...c, newItem]);
    setActiveId(newItem.id);
    setOpenGallery(false);
  }

  // --- Pointer sessions ---
  function lockPageScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function beginSession(e, id, mode, handle = null) {
    e.preventDefault(); e.stopPropagation();
    const box = boxRef.current;
    if (!box) return;
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setActiveId(id);
    const p = getLocalPoint(e, box);
    sessionRef.current = { id, mode, handle, startPointer: p, startItem: { ...it }, snapshotItems: [...items] };
    lockPageScroll(true);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endSession, { passive: false });
  }

  function onPointerMove(e) {
    if (!sessionRef.current) return;
    e.preventDefault();
    const box = boxRef.current;
    if (!box) return;
    const s = sessionRef.current;
    const p = getLocalPoint(e, box);
    const dx = (p.x - s.startPointer.x) / (scaleToFit || 1);
    const dy = (p.y - s.startPointer.y) / (scaleToFit || 1);
    const it0 = s.startItem;

    if (s.mode === "move") { updateItem(s.id, { x: it0.x + dx, y: it0.y + dy }); return; }
    if (s.mode === "rotate") {
      const cx = it0.x + it0.w / 2, cy = it0.y + it0.h / 2;
      updateItem(s.id, { rot: degFromPoints(cx, cy, cx + dx, cy + dy) });
      return;
    }

    const minSize = 40, maxSize = 5000;
    let x = it0.x, y = it0.y, w = it0.w, h = it0.h;
    const hdl = s.handle;
    if (hdl === "l" || hdl === "tl" || hdl === "bl") { x = it0.x + dx; w = it0.w - dx; }
    if (hdl === "r" || hdl === "tr" || hdl === "br") { w = it0.w + dx; }
    if (hdl === "t" || hdl === "tl" || hdl === "tr") { y = it0.y + dy; h = it0.h - dy; }
    if (hdl === "b" || hdl === "bl" || hdl === "br") { h = it0.h + dy; }
    w = clamp(w, minSize, maxSize); h = clamp(h, minSize, maxSize);
    if (hdl === "l" || hdl === "tl" || hdl === "bl") x = it0.x + (it0.w - w);
    if (hdl === "t" || hdl === "tl" || hdl === "tr") y = it0.y + (it0.h - h);

    if (it0.type === "text") {
      updateItem(s.id, { x, y, w, h, fontSize: clamp((it0.fontSize || 42) + dy * 0.15, 14, 160) });
    } else {
      updateItem(s.id, { x, y, w, h });
    }
  }

  function endSession() {
    if (sessionRef.current?.snapshotItems) {
      const s = sessionRef.current;
      setUndoStack((stack) => [...stack.slice(-19), { side, items: s.snapshotItems }]);
      setRedoStack([]);
    }
    sessionRef.current = null;
    lockPageScroll(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endSession);
  }

  // --- Keyboard shortcuts ---
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); return; }
      if (!activeId) return;
      const it = items.find((x) => x.id === activeId);
      if (!it) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const step = e.shiftKey ? 10 : 2;
      if (e.key === "ArrowLeft") updateItem(activeId, { x: it.x - step });
      if (e.key === "ArrowRight") updateItem(activeId, { x: it.x + step });
      if (e.key === "ArrowUp") updateItem(activeId, { y: it.y - step });
      if (e.key === "ArrowDown") updateItem(activeId, { y: it.y + step });
      if (e.key === "Delete" || e.key === "Backspace") removeActive();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, items, undoStack, redoStack]);

  const totalElements = (designBySide?.front?.length || 0) + (designBySide?.back?.length || 0);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {selectedColor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: selectedColor.hex }} />
                {selectedColor.name}
              </span>
            )}
            <span className="rounded-full bg-slate-50 px-2 py-0.5 font-medium">{selectedSize?.id || "N/A"}</span>
            {showFabric && <span className="rounded-full bg-slate-50 px-2 py-0.5 font-medium">{selectedFabric?.name || "Standard"}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!undoStack.length}
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-30 transition">
            <Undo2 size={13} /> Undo
          </button>
          <button onClick={redo} disabled={!redoStack.length}
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-30 transition">
            <Redo2 size={13} /> Redo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Canvas Area */}
        <div className="mx-auto w-full max-w-[540px]">
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 shadow-sm">
            <ShirtTintOverlay
              hex={selectedColor?.hex}
              imageUrl={mockups[side]}
              imgClass="absolute inset-0 h-full w-full object-contain select-none"
              alt="Tshirt"
            />

            {/* Side toggle */}
            <div className="absolute right-3 top-3 z-30 flex rounded-lg border border-slate-200 bg-white/95 shadow-sm overflow-hidden">
              <button
                onClick={() => { setActiveId(null); setSide("front"); }}
                className={["px-3 py-1.5 text-xs font-semibold transition", side === "front" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"].join(" ")}
              >
                Front
              </button>
              <button
                onClick={() => { setActiveId(null); setSide("back"); }}
                className={["px-3 py-1.5 text-xs font-semibold transition", side === "back" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"].join(" ")}
              >
                Back
              </button>
            </div>

            {/* Design area */}
            <div
              ref={areaRef}
              className="absolute left-1/2 top-[22%] -translate-x-1/2 overflow-hidden touch-none z-20"
              style={{ width: "78%", aspectRatio: "280 / 330" }}
              onPointerDown={() => setActiveId(null)}
            >
              <div
                ref={boxRef}
                className="relative mx-auto"
                style={{ width: printW, height: printH, transform: `scale(${scaleToFit || 1})`, transformOrigin: "top center" }}
              >
                <div className="absolute inset-0 border border-dashed border-indigo-300/50 rounded pointer-events-none" />

                {items.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <MousePointerClick size={28} className="text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 text-center">Add text or upload<br/>an image to start</p>
                  </div>
                )}

                {items.map((it) => {
                  const active = it.id === activeId;
                  return (
                    <div
                      key={it.id}
                      className="absolute"
                      style={{ left: it.x, top: it.y, width: it.w, height: it.h }}
                      onPointerDown={(e) => beginSession(e, it.id, "move")}
                    >
                      <div className="h-full w-full" style={{ transform: `rotate(${it.rot || 0}deg)`, transformOrigin: "center" }}>
                        {it.type === "image" ? (
                          <img src={it.src} alt="design" className="h-full w-full object-contain select-none pointer-events-none" draggable={false} />
                        ) : (
                          <div className="h-full w-full select-none flex items-start overflow-hidden"
                            style={{ fontSize: it.fontSize || 42, fontWeight: it.fontWeight || 600, fontFamily: it.fontFamily || "sans-serif", color: it.fontColor || "#111", textAlign: it.textAlign || "left", lineHeight: 1.05 }}>
                            {it.text}
                          </div>
                        )}
                      </div>

                      {active && (
                        <div className="absolute inset-0 border-2 border-indigo-500 rounded-sm">
                          <button onPointerDown={(e) => { e.stopPropagation(); removeActive(); }}
                            className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white z-40 shadow-md" title="Delete">
                            <Trash2 size={12} />
                          </button>
                          <button onPointerDown={(e) => beginSession(e, it.id, "rotate")}
                            className="absolute left-1/2 -top-9 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-indigo-300 shadow cursor-grab active:cursor-grabbing z-40" title="Rotate">
                            <RotateCw size={12} className="text-indigo-600" />
                          </button>
                          <div className="absolute left-1/2 -top-2 -translate-x-1/2 h-2 w-[2px] bg-indigo-400 z-40" />
                          {["tl","tr","bl","br","t","b","l","r"].map((p) => (
                            <ResizeHandle key={p} pos={p} onDown={(e) => beginSession(e, it.id, "resize", p)} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUploadFile} />

          {/* Mobile bottom actions */}
          <div className="relative z-50 lg:hidden">
            <BottomActions mode="edit" onAddText={() => setMobileTextOpen(true)} onUpload={onUploadClick}
              onOpenGallery={() => setOpenGallery(true)} onSave={() => {}} onNext={onNext} />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col gap-4 max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900">Design Tools</h3>
            <p className="text-xs text-slate-400 mt-0.5">Add elements and customize your design</p>
          </div>

          {/* Upload & Gallery */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onUploadClick}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition">
              <Upload size={16} /> Upload
            </button>
            <button onClick={() => setOpenGallery(true)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition">
              <ImageIcon size={16} /> Gallery
            </button>
          </div>

          {/* Text Panel */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type size={15} className="text-indigo-600" />
              <span className="text-sm font-bold text-slate-700">Text</span>
            </div>
            <TextPanel
              activeItem={activeItem?.type === "text" ? activeItem : null}
              onAddText={addText}
              onUpdateText={updateItem}
              isAdding={!activeItem || activeItem.type !== "text"}
            />
          </div>

          {/* Selected Layer */}
          {activeItem && (
            <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Selected Element</div>
              <button onClick={removeActive}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                <Trash2 size={14} /> Delete
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => {
                  if (!activeId) return;
                  setItemsWithHistory((curr) => { const idx = curr.findIndex((x) => x.id === activeId); if (idx < 0) return curr; const copy = curr.slice(); const [it] = copy.splice(idx, 1); copy.push(it); return copy; });
                }} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition">
                  <ArrowUpToLine size={13} /> Front
                </button>
                <button onClick={() => {
                  if (!activeId) return;
                  setItemsWithHistory((curr) => { const idx = curr.findIndex((x) => x.id === activeId); if (idx < 0) return curr; const copy = curr.slice(); const [it] = copy.splice(idx, 1); copy.unshift(it); return copy; });
                }} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition">
                  <ArrowDownToLine size={13} /> Back
                </button>
              </div>
            </div>
          )}

          {/* Layers */}
          <LayersPanel items={items} activeId={activeId} setActiveId={setActiveId} onDelete={deleteById} onReorder={reorderItem} />

          {/* Continue Button */}
          <button onClick={onNext}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition active:scale-[0.98]">
            Preview & Add to Cart <ArrowRight size={16} />
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            Arrow keys to nudge &middot; Shift+Arrow for big moves &middot; Ctrl+Z undo &middot; Ctrl+Y redo
          </p>
        </aside>
      </div>

      {/* Mobile Text Sheet */}
      {mobileTextOpen && (
        <div className="fixed inset-0 z-[60] flex items-end lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileTextOpen(false)} />
          <div className="relative w-full rounded-t-2xl bg-white p-5 pb-8 shadow-xl" style={{ animation: "slideUp 250ms ease-out" }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <TextPanel
              activeItem={activeItem?.type === "text" ? activeItem : null}
              onAddText={(config) => { addText(config); setMobileTextOpen(false); }}
              onUpdateText={updateItem}
              isAdding={!activeItem || activeItem.type !== "text"}
            />
          </div>
        </div>
      )}

      <GalleryModal open={openGallery} onClose={() => setOpenGallery(false)} tabs={galleryTabs} itemsByTab={galleryItems} onPick={pickGalleryItem} />
    </div>
  );
}
