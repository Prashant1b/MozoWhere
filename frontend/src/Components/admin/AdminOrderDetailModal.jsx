import React, { useState } from "react";
import {
  X,
  Download,
  Eye,
  Package,
  Palette,
  Ruler,
  Layers,
  Type,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const COLOR_HEX_MAP = {
  white: "#FFFFFF", black: "#111827", navy: "#1e3a8a", blue: "#2563eb",
  sky: "#7dd3fc", lavender: "#c4b5fd", mint: "#6ee7b7", sand: "#d6b48a",
  red: "#ef4444", yellow: "#facc15", green: "#22c55e", gray: "#9ca3af",
  grey: "#9ca3af", maroon: "#7f1d1d", beige: "#d6d3c8", orange: "#f97316",
  pink: "#ec4899", purple: "#8b5cf6", brown: "#92400e",
};

function colorToHex(name) {
  return COLOR_HEX_MAP[String(name || "").trim().toLowerCase()] || "#e5e7eb";
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function downloadImageUrl(url, filename) {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

export default function AdminOrderDetailModal({ order, onClose }) {
  const [previewImg, setPreviewImg] = useState(null);
  const [expandedItem, setExpandedItem] = useState(0);

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const customItems = items.filter((i) => i.type === "custom");
  const productItems = items.filter((i) => i.type !== "custom");
  const userEmail = order.user?.emailid || order.user?.email || "-";
  const addr = order.shippingAddress || {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="fixed inset-4 z-50 mx-auto my-auto flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Order Details</h2>
            <p className="mt-0.5 text-xs text-gray-500 font-mono">{order._id}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <InfoCard label="Customer" value={userEmail} />
            <InfoCard label="Status" value={order.orderStatus || "pending"} />
            <InfoCard label="Payment" value={`${order.paymentMethod || "-"} / ${order.paymentStatus || "-"}`} />
            <InfoCard label="Shipping" value={order.shippingCharge > 0 ? `Rs ${order.shippingCharge}` : "Free"} />
            <InfoCard label="Total" value={`Rs ${Number(order.totalAmount || 0)}`} />
          </div>

          {/* Shipping */}
          {addr.name && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Shipping Address</div>
              <div className="text-sm text-gray-800">
                {addr.name} | {addr.phone}<br />
                {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
              </div>
            </div>
          )}

          {/* Custom Items — Full Design Details */}
          {customItems.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 mb-3">
                <Palette size={16} /> Customized Items ({customItems.length})
              </h3>

              <div className="space-y-4">
                {customItems.map((item, idx) => (
                  <CustomItemCard
                    key={idx}
                    item={item}
                    index={idx}
                    expanded={expandedItem === idx}
                    onToggle={() => setExpandedItem(expandedItem === idx ? -1 : idx)}
                    onPreview={setPreviewImg}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Items */}
          {productItems.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 mb-3">
                <Package size={16} /> Regular Items ({productItems.length})
              </h3>
              <div className="space-y-2">
                {productItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="h-14 w-14 rounded-lg border border-gray-100 object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
                      <div className="text-xs text-gray-500">{[item.color, item.size].filter(Boolean).join(" | ")}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-bold">Rs {item.unitPrice}</div>
                      <div className="text-xs text-gray-500">x {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen image preview */}
      {previewImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur"
          onClick={() => setPreviewImg(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={previewImg} alt="Preview" className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl" />
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => {
                  if (previewImg.startsWith("data:")) {
                    downloadDataUrl(previewImg, "design-preview.png");
                  } else {
                    downloadImageUrl(previewImg, "design-asset.png");
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow hover:bg-gray-100 transition"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={() => setPreviewImg(null)}
                className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700 transition"
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900 truncate">{value}</div>
    </div>
  );
}

function CustomItemCard({ item, index, expanded, onToggle, onPreview }) {
  const snap = item.customSnapshot || {};
  const sel = snap.selected || {};
  const layers = Array.isArray(snap.layers) ? snap.layers : [];
  const preview = snap.preview || {};
  const sides = ["front", "back", "left", "right"].filter((s) => preview[s]);
  const imageLayers = layers.filter((l) => l.kind === "image" && l.imageUrl);
  const textLayers = layers.filter((l) => l.kind === "text" && l.text);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        {item.image && (
          <img src={item.image} alt={item.title} className="h-12 w-12 rounded-lg border border-gray-100 object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm truncate">{item.title || "Customized Product"}</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {sel.color && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300" style={{ backgroundColor: colorToHex(sel.color) }} />
                {sel.color}
              </span>
            )}
            {sel.size && <span className="text-xs text-gray-600">Size: {sel.size}</span>}
            {sel.fabric && <span className="text-xs text-gray-600">{sel.fabric}</span>}
            <span className="text-xs text-gray-500">{layers.length} layer(s)</span>
          </div>
        </div>
        <div className="text-right mr-2">
          <div className="font-bold text-sm">Rs {item.unitPrice}</div>
          <div className="text-xs text-gray-500">x {item.quantity}</div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Preview images */}
          {sides.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Design Previews</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {sides.map((side) => (
                  <div key={side} className="group relative">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 aspect-[4/5]">
                      <img
                        src={preview[side]}
                        alt={`${side} preview`}
                        className="h-full w-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => onPreview(preview[side])}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600 capitalize">{side}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onPreview(preview[side])}
                          className="grid h-6 w-6 place-items-center rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                          title="View full size"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (preview[side].startsWith("data:")) {
                              downloadDataUrl(preview[side], `design-${side}.png`);
                            } else {
                              downloadImageUrl(preview[side], `design-${side}.png`);
                            }
                          }}
                          className="grid h-6 w-6 place-items-center rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                          title="Download"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Layers — downloadable assets */}
          {imageLayers.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                <ImageIcon size={12} className="inline mr-1" />
                Uploaded Images ({imageLayers.length})
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {imageLayers.map((layer, li) => (
                  <div key={li} className="group relative">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 aspect-square">
                      <img
                        src={layer.imageUrl}
                        alt={`Layer ${li + 1}`}
                        className="h-full w-full object-contain p-1 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => onPreview(layer.imageUrl)}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">
                        {layer.side} | {Math.round(layer.w)}x{Math.round(layer.h)}
                      </span>
                      <button
                        onClick={() => {
                          if (layer.imageUrl.startsWith("data:")) {
                            downloadDataUrl(layer.imageUrl, `layer-${li + 1}.png`);
                          } else {
                            downloadImageUrl(layer.imageUrl, `layer-${li + 1}.png`);
                          }
                        }}
                        className="grid h-5 w-5 place-items-center rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                        title="Download"
                      >
                        <Download size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Layers — print info */}
          {textLayers.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                <Type size={12} className="inline mr-1" />
                Text Layers ({textLayers.length})
              </div>
              <div className="space-y-2">
                {textLayers.map((layer, li) => (
                  <div key={li} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div
                      className="text-base mb-2"
                      style={{
                        fontFamily: layer.font || "sans-serif",
                        fontWeight: layer.fontWeight || "700",
                        color: layer.color || "#111111",
                      }}
                    >
                      "{layer.text}"
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                      <span>Side: <b className="text-gray-700">{layer.side}</b></span>
                      <span>Font: <b className="text-gray-700">{layer.font || "sans-serif"}</b></span>
                      <span>Size: <b className="text-gray-700">{layer.fontSize || 32}px</b></span>
                      <span className="flex items-center gap-1">
                        Color: <span className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300" style={{ backgroundColor: layer.color || "#111" }} />
                        <b className="text-gray-700">{layer.color || "#111111"}</b>
                      </span>
                      <span>Position: <b className="text-gray-700">{Math.round(layer.x)}, {Math.round(layer.y)}</b></span>
                      {layer.rotate ? <span>Rotation: <b className="text-gray-700">{layer.rotate}deg</b></span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download all buttons */}
          {(sides.length > 0 || imageLayers.length > 0) && (
            <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
              {sides.length > 0 && (
                <button
                  onClick={() => {
                    sides.forEach((side, i) => {
                      setTimeout(() => {
                        const id = (item.customDesignId || "design").toString().slice(-6);
                        if (preview[side].startsWith("data:")) {
                          downloadDataUrl(preview[side], `order-${id}-${side}.png`);
                        } else {
                          downloadImageUrl(preview[side], `order-${id}-${side}.png`);
                        }
                      }, 300 * i);
                    });
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                  <Download size={16} /> Download All Previews
                </button>
              )}
              {imageLayers.length > 0 && (
                <button
                  onClick={() => {
                    imageLayers.forEach((layer, i) => {
                      setTimeout(() => {
                        if (layer.imageUrl.startsWith("data:")) {
                          downloadDataUrl(layer.imageUrl, `uploaded-image-${i + 1}.png`);
                        } else {
                          downloadImageUrl(layer.imageUrl, `uploaded-image-${i + 1}.png`);
                        }
                      }, 300 * i);
                    });
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition"
                >
                  <Download size={16} /> Download All Uploaded Photos
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
