import React, { useEffect, useMemo, useState } from "react";

export default function CustomizeTemplateFormModal({
  open,
  onClose,
  onSubmit,
  saving,
  initial,
}) {
  const isEdit = !!initial?._id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("tshirt"); // tshirt/hoodie/accessory etc
  const [basePrice, setBasePrice] = useState("");
  const [colorsText, setColorsText] = useState("");
  const [sizesText, setSizesText] = useState("");
  const [fabricsText, setFabricsText] = useState(""); // ids or slugs (you populate, but create expects ids ideally)
  const [mockupsText, setMockupsText] = useState(""); // JSON
  const [printAreasText, setPrintAreasText] = useState(""); // JSON array
  const [isActive, setIsActive] = useState(true); // backend list only active

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title || "");
    setSlug(initial?.slug || "");
    setType(initial?.type || "tshirt");
    setBasePrice(initial?.basePrice != null ? String(initial.basePrice) : "");
    setColorsText(Array.isArray(initial?.colors) ? initial.colors.join(", ") : "");
    setSizesText(Array.isArray(initial?.sizes) ? initial.sizes.join(", ") : "");
    setFabricsText(
      Array.isArray(initial?.fabrics)
        ? initial.fabrics.map((f) => (typeof f === "string" ? f : f?._id)).filter(Boolean).join(", ")
        : ""
    );
    setMockupsText(initial?.mockups ? JSON.stringify(initial.mockups, null, 2) : "");
    setPrintAreasText(
      Array.isArray(initial?.printAreas) ? JSON.stringify(initial.printAreas, null, 2) : ""
    );
    setIsActive(initial?.isActive ?? true);
  }, [open, initial]);

  const payload = useMemo(() => {
    const colors = colorsText.split(",").map((s) => s.trim()).filter(Boolean);
    const sizes = sizesText.split(",").map((s) => s.trim()).filter(Boolean);
    const fabrics = fabricsText.split(",").map((s) => s.trim()).filter(Boolean);

    let mockups = {};
    if (mockupsText.trim()) {
      try {
        mockups = JSON.parse(mockupsText);
      } catch {
        // leave as {}
      }
    }

    let printAreas = [];
    if (printAreasText.trim()) {
      try {
        const parsed = JSON.parse(printAreasText);
        printAreas = Array.isArray(parsed) ? parsed : [];
      } catch {
        printAreas = [];
      }
    }

    return {
      title,
      slug: slug || undefined,
      type,
      basePrice: basePrice === "" ? undefined : Number(basePrice),
      colors,
      sizes,
      fabrics,
      mockups,
      printAreas,
      isActive,
    };
  }, [title, slug, type, basePrice, colorsText, sizesText, fabricsText, mockupsText, printAreasText, isActive]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative mx-auto my-6 w-full max-w-3xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="font-extrabold text-gray-900">
              {isEdit ? "Edit Template" : "Create Template"}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <form
            className="flex-1 overflow-y-auto p-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              // basic validation for JSON fields
              if (mockupsText.trim()) {
                try { JSON.parse(mockupsText); } catch { return alert("Mockups JSON invalid"); }
              }
              if (printAreasText.trim()) {
                try { JSON.parse(printAreasText); } catch { return alert("PrintAreas JSON invalid"); }
              }
              onSubmit(payload);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                  required
                />
              </Field>

              <Field label="Slug (optional)">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto from title if empty"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Type" >
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                >
                  <option value="tshirt">tshirt</option>
                  <option value="hoodie">hoodie</option>
                  <option value="cap">cap</option>
                  <option value="mug">mug</option>
                  <option value="pen">pen</option>
                  <option value="accessory">accessory</option>
                </select>
              </Field>

              <Field label="Base Price">
                <input
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  type="number"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                  required
                />
              </Field>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                  Active (list API shows only active)
                </label>
              </div>

              <Field label="Colors (comma separated)" span>
                <input
                  value={colorsText}
                  onChange={(e) => setColorsText(e.target.value)}
                  placeholder="black, white, navy"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Sizes (comma separated)" span>
                <input
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Fabrics (comma separated ids)" span>
                <input
                  value={fabricsText}
                  onChange={(e) => setFabricsText(e.target.value)}
                  placeholder="66c..id1, 66c..id2"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Mockups (JSON object)" span>
                <textarea
                  value={mockupsText}
                  onChange={(e) => setMockupsText(e.target.value)}
                  rows={6}
                  placeholder={`{\n  "front": "https://.../front.png",\n  "back": "https://.../back.png"\n}`}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-400 font-mono text-[12px]"
                />
              </Field>

              <Field label="Print Areas (JSON array)" span>
                <textarea
                  value={printAreasText}
                  onChange={(e) => setPrintAreasText(e.target.value)}
                  rows={6}
                  placeholder={`[\n  { "name": "front", "x": 0.2, "y": 0.2, "w": 0.6, "h": 0.6 }\n]`}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-400 font-mono text-[12px]"
                />
              </Field>
            </div>

            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-2 border-t border-gray-200 p-4 -mx-5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
