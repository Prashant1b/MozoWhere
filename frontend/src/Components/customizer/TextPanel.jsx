import { useEffect, useState } from "react";
import { Bold, AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";

const FONT_OPTIONS = [
  { label: "Sans Serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Cursive", value: "cursive" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
];

const COLOR_SWATCHES = [
  "#111111", "#FFFFFF", "#EF4444", "#3B82F6", "#22C55E",
  "#F59E0B", "#8B5CF6", "#EC4899", "#F97316", "#06B6D4",
];

export default function TextPanel({ activeItem, onAddText, onUpdateText, isAdding }) {
  const [inputText, setInputText] = useState("");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [fontColor, setFontColor] = useState("#111111");
  const [fontSize, setFontSize] = useState(42);
  const [fontWeight, setFontWeight] = useState(600);
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    if (activeItem && !isAdding) {
      setInputText(activeItem.text || "");
      setFontFamily(activeItem.fontFamily || "sans-serif");
      setFontColor(activeItem.fontColor || "#111111");
      setFontSize(activeItem.fontSize || 42);
      setFontWeight(activeItem.fontWeight || 600);
      setTextAlign(activeItem.textAlign || "left");
    }
  }, [activeItem?.id, isAdding]);

  useEffect(() => {
    if (!isAdding && activeItem) {
      onUpdateText(activeItem.id, { text: inputText, fontFamily, fontColor, fontSize, fontWeight, textAlign });
    }
  }, [inputText, fontFamily, fontColor, fontSize, fontWeight, textAlign]);

  function handleSubmit() {
    if (!inputText.trim()) return;
    if (isAdding) {
      onAddText({ text: inputText, fontFamily, fontColor, fontSize, fontWeight, textAlign });
      setInputText("");
      setFontFamily("sans-serif");
      setFontColor("#111111");
      setFontSize(42);
      setFontWeight(600);
      setTextAlign("left");
    }
  }

  const alignBtn = (val, Icon) => (
    <button type="button" onClick={() => setTextAlign(val)} title={`Align ${val}`}
      className={[
        "flex h-8 flex-1 items-center justify-center rounded-lg border text-sm transition",
        textAlign === val ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50",
      ].join(" ")}>
      <Icon size={14} />
    </button>
  );

  return (
    <div className="space-y-3">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your text here..."
        rows={2}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
      />

      <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none">
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
        ))}
      </select>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Size</label>
          <span className="text-[10px] font-bold text-indigo-600">{fontSize}px</span>
        </div>
        <input type="range" min={14} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full accent-indigo-600" />
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1 block">Color</label>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_SWATCHES.map((hex) => (
            <button key={hex} type="button" onClick={() => setFontColor(hex)} title={hex}
              className={[
                "h-6 w-6 rounded-full border-2 transition",
                fontColor === hex ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-400",
              ].join(" ")}
              style={{ backgroundColor: hex }}
            />
          ))}
          <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded-full border-0 p-0" title="Custom" />
        </div>
      </div>

      <div className="flex gap-1.5">
        <button type="button" onClick={() => setFontWeight((w) => (w === 600 ? 400 : 600))} title="Bold"
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition",
            fontWeight === 600 ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50",
          ].join(" ")}>
          <Bold size={14} />
        </button>
        {alignBtn("left", AlignLeft)}
        {alignBtn("center", AlignCenter)}
        {alignBtn("right", AlignRight)}
      </div>

      {isAdding && (
        <button type="button" onClick={handleSubmit} disabled={!inputText.trim()}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 transition">
          <Plus size={14} /> Add Text
        </button>
      )}
    </div>
  );
}
