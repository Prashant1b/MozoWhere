import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customizeTemplateApi } from "../api/customizeTemplate.api";
import BulkBanner from "../Components/customizerlisting/BulkBanner";

const ACCESSORY_TYPES = new Set(["cap", "mug", "pen", "accessory"]);

const SORT_OPTIONS = [
  { id: "latest", label: "Newest" },
  { id: "priceLow", label: "Price: Low to High" },
  { id: "priceHigh", label: "Price: High to Low" },
  { id: "title", label: "Name: A to Z" },
];

function getTemplateImage(t) {
  return t?.mockups?.front || t?.mockups?.back || t?.mockups?.left || t?.mockups?.right || "";
}

export default function CustomizeListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [templates, setTemplates] = useState([]);

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [fabric, setFabric] = useState("all");
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await customizeTemplateApi.list();
        const all = res.data?.templates || [];
        setTemplates(all.filter((t) => !ACCESSORY_TYPES.has(String(t?.type || ""))));
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const typeOptions = useMemo(() => {
    const set = new Set(templates.map((t) => t?.type).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [templates]);

  const fabricOptions = useMemo(() => {
    const set = new Set();
    for (const t of templates) {
      for (const f of t?.fabrics || []) {
        set.add(f?.name || f?.slug || "");
      }
    }
    return ["all", ...Array.from(set).filter(Boolean)];
  }, [templates]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const out = templates.filter((t) => {
      const title = String(t?.title || "").toLowerCase();
      const slug = String(t?.slug || "").toLowerCase();
      const fabrics = (t?.fabrics || []).map((f) => String(f?.name || f?.slug || "").toLowerCase());

      const qOk = !needle || title.includes(needle) || slug.includes(needle);
      const typeOk = type === "all" || t?.type === type;
      const fabricOk = fabric === "all" || fabrics.includes(fabric.toLowerCase());

      return qOk && typeOk && fabricOk;
    });

    out.sort((a, b) => {
      if (sort === "priceLow") return Number(a?.basePrice || 0) - Number(b?.basePrice || 0);
      if (sort === "priceHigh") return Number(b?.basePrice || 0) - Number(a?.basePrice || 0);
      if (sort === "title") return String(a?.title || "").localeCompare(String(b?.title || ""));
      return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
    });

    return out;
  }, [templates, q, type, fabric, sort]);

  const openCustomizer = (template) => {
    if (!template?.slug) return;
    navigate(`/customizer/${template.slug}`, { state: { template } });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>Custom Studio</span>
          <span>Live Templates from Backend</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">Customize Products</h1>
              <p className="mt-1 text-sm text-slate-600">Pick a template first, then open the design studio to customize color, size and print.</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{filtered.length} templates</div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search template name"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              {typeOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "all" ? "All Types" : v}
                </option>
              ))}
            </select>

            <select
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              {fabricOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "all" ? "All Fabrics" : v}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              {SORT_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  Sort: {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading templates...</div>
        ) : err ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No templates found.</div>
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
                    <img
                      src={getTemplateImage(t)}
                      alt={t.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs font-semibold text-slate-500">No image</div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold uppercase text-slate-700">
                    {t.type}
                  </span>
                </div>

                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-bold text-slate-900">{t.title}</div>
                  <div className="mt-1 text-xs text-slate-500 line-clamp-1">{(t.fabrics || []).map((f) => f?.name).filter(Boolean).join(" | ") || "Standard fabric"}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">Rs {Number(t.basePrice || 0)}</div>
                      <div className="text-[11px] text-slate-500">{(t.colors || []).length} colors | {(t.sizes || []).length} sizes</div>
                    </div>
                    <span className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white">Customize</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          <BulkBanner />
        </div>
      </div>
    </div>
  );
}


