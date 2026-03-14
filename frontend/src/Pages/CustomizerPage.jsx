import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Palette, Loader2 } from "lucide-react";

import StepsBar from "../Components/customizer/StepsBar";
import PickColorSize from "../Components/customizer/PickColorSize";
import FinaliseDesign from "../Components/customizer/FinaliseDesign";
import PreviewStep from "../Components/customizer/PreviewStep";
import { customizeTemplateApi } from "../api/customizeTemplate.api";
import { customizeDesignApi } from "../api/customizeDesign.api";
import { buildPreviewForSide } from "../utils/customPreview";

const COLOR_HEX_MAP = {
  white: "#FFFFFF", black: "#111827", navy: "#1e3a8a", blue: "#2563eb",
  sky: "#7dd3fc", lavender: "#c4b5fd", mint: "#6ee7b7", sand: "#d6b48a",
  red: "#ef4444", yellow: "#facc15", green: "#22c55e", gray: "#9ca3af",
  grey: "#9ca3af", maroon: "#7f1d1d", beige: "#d6d3c8", orange: "#f97316",
  pink: "#ec4899", purple: "#8b5cf6", brown: "#92400e",
};

const DEFAULT_FABRICS = [
  { _id: "default-cotton", name: "Cotton", extraPrice: 0 },
  { _id: "default-premium", name: "Premium Cotton", extraPrice: 99 },
  { _id: "default-blend", name: "Poly-Cotton Blend", extraPrice: 49 },
];

function colorToHex(name, index) {
  const key = String(name || "").trim().toLowerCase();
  if (COLOR_HEX_MAP[key]) return COLOR_HEX_MAP[key];
  const fallback = ["#e2e8f0", "#cbd5e1", "#94a3b8", "#a3a3a3"];
  return fallback[index % fallback.length];
}

function toObjectIdMaybe(v) {
  const s = String(v || "");
  return /^[a-f\d]{24}$/i.test(s) ? s : null;
}

function mapLayers(designBySide) {
  const out = [];
  for (const [side, items] of Object.entries(designBySide || {})) {
    for (const it of items || []) {
      if (it?.type === "text") {
        out.push({
          kind: "text", side, x: it.x, y: it.y, w: it.w, h: it.h,
          rotate: it.rot || 0, text: it.text || "", fontSize: it.fontSize || 32,
          color: it.fontColor || "#111111", font: it.fontFamily || "sans-serif",
          fontWeight: it.fontWeight || "700", textAlign: it.textAlign || "left",
        });
      } else {
        out.push({
          kind: "image", side, x: it.x, y: it.y, w: it.w, h: it.h,
          rotate: it.rot || 0, imageUrl: it.src || "",
        });
      }
    }
  }
  return out;
}

function getTemplateHeroImage(template) {
  return template?.mockups?.front || template?.mockups?.back || template?.mockups?.left || template?.mockups?.right || "";
}

export default function CustomizerPage() {
  const { slug } = useParams();
  const location = useLocation();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [template, setTemplate] = useState(location.state?.template || null);

  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);

  function goToStep(nextStep) {
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      requestAnimationFrame(() => setAnimating(false));
    }, 180);
  }

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [designBySide, setDesignBySide] = useState({ front: [], back: [] });
  const [addingCustom, setAddingCustom] = useState(false);
  const [addMessage, setAddMessage] = useState("");

  const isAccessoryType = ["cap", "mug", "pen", "accessory"].includes(
    String(template?.type || "").toLowerCase()
  );

  useEffect(() => {
    const templateSlug = slug || location.state?.template?.slug;
    if (!templateSlug) {
      setLoading(false);
      setErr("Please select a product template from Customize Listing first.");
      return;
    }
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await customizeTemplateApi.detail(templateSlug);
        setTemplate(res.data?.template || null);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, location.state]);

  const colors = useMemo(() => {
    return (template?.colors || []).map((name, i) => ({
      id: String(name).toLowerCase().replace(/\s+/g, "-"),
      name, hex: colorToHex(name, i),
    }));
  }, [template]);

  const sizes = useMemo(() => {
    return (template?.sizes || []).map((size) => ({ id: String(size), stock: null }));
  }, [template]);

  const fabrics = useMemo(() => {
    if (isAccessoryType) return [];
    const fromBackend = template?.fabrics || [];
    return fromBackend.length ? fromBackend : DEFAULT_FABRICS;
  }, [template, isAccessoryType]);

  useEffect(() => {
    if (colors.length && !selectedColor) setSelectedColor(colors[0]);
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
    if (fabrics.length && !selectedFabric) setSelectedFabric(fabrics[0]);
    if (!fabrics.length && selectedFabric) setSelectedFabric(null);
  }, [colors, sizes, fabrics, selectedColor, selectedSize, selectedFabric]);

  const canGoStep2 = useMemo(() => {
    const fabricOk = !fabrics.length || Boolean(selectedFabric);
    const sizeOk = !sizes.length || Boolean(selectedSize?.id);
    return Boolean(selectedColor?.id) && sizeOk && fabricOk;
  }, [selectedColor, selectedSize, selectedFabric, fabrics, sizes]);

  const mockups = useMemo(() => {
    const front = template?.mockups?.front || "";
    const back = template?.mockups?.back || front || "";
    return { front, back };
  }, [template]);

  const galleryTabs = useMemo(
    () => (Array.isArray(template?.galleryTabs) ? template.galleryTabs : []),
    [template]
  );

  const galleryItems = useMemo(
    () => (template?.galleryItems && typeof template.galleryItems === "object" ? template.galleryItems : {}),
    [template]
  );

  const onAddCustomToCart = async () => {
    if (!template?._id) return;
    setAddMessage("");
    setAddingCustom(true);
    try {
      const fabricId = toObjectIdMaybe(selectedFabric?._id || selectedFabric?.id);
      const layers = mapLayers(designBySide);
      const [previewFront, previewBack] = await Promise.all([
        buildPreviewForSide({ mockupSrc: mockups.front || mockups.back || "", tintHex: selectedColor?.hex || "#ffffff", layers, side: "front" }),
        buildPreviewForSide({ mockupSrc: mockups.back || mockups.front || "", tintHex: selectedColor?.hex || "#ffffff", layers, side: "back" }),
      ]);
      await customizeDesignApi.finalizeAndCart({
        templateId: template._id, color: selectedColor?.name, size: selectedSize?.id,
        ...(fabricId ? { fabricId } : {}), layers,
        preview: { front: previewFront || "", back: previewBack || "" },
      });
      setAddMessage("Customized item added to cart");
      nav("/cart");
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/login", { state: { from: `/customizer/${template?.slug || slug}` } });
        return;
      }
      setAddMessage(e?.response?.data?.message || e?.message || "Failed to add customized item");
    } finally {
      setAddingCustom(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading design studio...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto mt-12 max-w-lg px-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm text-rose-700">{err}</p>
          <button onClick={() => nav("/customize")} className="mt-4 rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700">
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="mx-auto mt-12 max-w-lg px-4 text-center">
        <p className="text-sm text-slate-600">Template not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                <Palette size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{template.title}</h1>
                <p className="text-xs text-slate-500">
                  {template.type || "Apparel"} &middot; Starting from <span className="font-semibold text-slate-700">Rs {Number(template.basePrice || 0)}</span>
                </p>
              </div>
            </div>

            {/* Quick info pills */}
            <div className="flex gap-2">
              {selectedColor && (
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                  <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: selectedColor.hex }} />
                  {selectedColor.name}
                </div>
              )}
              {selectedSize && (
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                  Size: {selectedSize.id}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <StepsBar step={step} />

      {/* Step Content */}
      <div className={`transition-all duration-200 ease-out ${animating ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}>
        {step === 1 && (
          <PickColorSize
            previewImage={getTemplateHeroImage(template)}
            productTitle={template.title}
            productType={template.type}
            basePrice={Number(template.basePrice || 0)}
            colors={colors}
            sizes={sizes}
            fabrics={fabrics}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedFabric={selectedFabric}
            setSelectedFabric={setSelectedFabric}
            onNext={() => { if (canGoStep2) goToStep(2); }}
          />
        )}

        {step === 2 && (
          <FinaliseDesign
            mockups={mockups}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            selectedFabric={selectedFabric}
            showFabric={!isAccessoryType}
            designBySide={designBySide}
            setDesignBySide={setDesignBySide}
            galleryTabs={galleryTabs}
            galleryItems={galleryItems}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}

        {step === 3 && (
          <PreviewStep
            mockups={mockups}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            selectedFabric={selectedFabric}
            showFabric={!isAccessoryType}
            designBySide={designBySide}
            addingCustom={addingCustom}
            addMessage={addMessage}
            onAddToBag={onAddCustomToCart}
            onBack={() => goToStep(2)}
          />
        )}
      </div>
    </div>
  );
}
