import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customizeTemplateApi } from "../api/customizeTemplate.api";

const ACCESSORY_TYPES = ["cap", "mug", "pen", "accessory"];

const TYPE_LABEL = {
  all: "All Accessories",
  cap: "Caps",
  mug: "Mugs",
  pen: "Pens",
  accessory: "Other Accessories",
};

function getTemplateImage(t) {
  return t?.mockups?.front || t?.mockups?.back || t?.mockups?.left || t?.mockups?.right || "";
}

export default function CustomizeAccessoriesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [templates, setTemplates] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await customizeTemplateApi.list();
        const all = res.data?.templates || [];
        setTemplates(all.filter((t) => ACCESSORY_TYPES.includes(String(t?.type || ""))));
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load accessory templates");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return templates
      .filter((t) => {
        const title = String(t?.title || "").toLowerCase();
        const slug = String(t?.slug || "").toLowerCase();
        const qOk = !needle || title.includes(needle) || slug.includes(needle);
        const typeOk = type === "all" || t?.type === type;
        return qOk && typeOk;
      })
      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  }, [templates, q, type]);

  const openCustomizer = (template) => {
    if (!template?.slug) return;
    navigate(`/customizer/${template.slug}`, { state: { template } });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Custom Accessories Studio</div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">Customize Accessories</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Choose template for mug, pen, jug, cap and accessories. Then open easy editor to add text/logo and place it quickly.
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {filtered.length} templates
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search accessories template"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {["all", ...ACCESSORY_TYPES].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={[
                    "h-11 rounded-xl border text-xs font-bold uppercase tracking-wide transition",
                    type === t
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 1</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Pick template</div>
              <div className="mt-1 text-xs text-slate-600">Choose cap/mug/pen/jug base product.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 2</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Easy edit</div>
              <div className="mt-1 text-xs text-slate-600">Upload logo, add text, drag and resize in one screen.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 3</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Preview and order</div>
              <div className="mt-1 text-xs text-slate-600">Check design and add customized product to cart.</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading templates...</div>
        ) : err ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No accessory templates found. Add templates from admin panel with type cap/mug/pen/accessory.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => openCustomizer(t)}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-square bg-slate-100">
                  {getTemplateImage(t) ? (
                    <img src={getTemplateImage(t)} alt={t.title} className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-semibold text-slate-500">No image</div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold uppercase text-slate-700">
                    {t.type}
                  </span>
                </div>

                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-bold text-slate-900">{t.title}</div>
                  <div className="mt-1 text-xs text-slate-500 line-clamp-1">
                    {(t.colors || []).length} colors | {(t.sizes || []).length || "No"} sizes
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-extrabold text-slate-900">Rs {Number(t.basePrice || 0)}</div>
                    <span className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white">Customize</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
