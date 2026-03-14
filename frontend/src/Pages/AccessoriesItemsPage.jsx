import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../api/product.api";

const ACCESSORY_KEYS = ["accessory", "accessories", "cap", "mug", "pen", "jug", "bottle"];

function isAccessoryProduct(p) {
  const categoryName = String(p?.category?.name || "").toLowerCase();
  const categorySlug = String(p?.category?.slug || "").toLowerCase();
  const title = String(p?.title || "").toLowerCase();
  const tags = Array.isArray(p?.tags) ? p.tags.map((t) => String(t).toLowerCase()) : [];

  const joined = [categoryName, categorySlug, title, ...tags].join(" ");
  return ACCESSORY_KEYS.some((k) => joined.includes(k));
}

function getType(p) {
  const s = [
    String(p?.category?.slug || "").toLowerCase(),
    String(p?.category?.name || "").toLowerCase(),
    String(p?.title || "").toLowerCase(),
  ].join(" ");
  if (s.includes("cap")) return "caps";
  if (s.includes("mug")) return "mugs";
  if (s.includes("pen")) return "pens";
  return "other";
}

export default function AccessoriesItemsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [type, setType] = useState("all");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await productApi.list({
          limit: 500,
          sort: "-createdAt",
          active: "true",
        });
        if (!mounted) return;
        const products = res.data?.products || [];
        setItems(products.filter(isAccessoryProduct));
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load accessories");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (type === "all") return items;
    return items.filter((p) => getType(p) === type);
  }, [items, type]);

  return (
    <section className="min-h-screen bg-[#f7f8fb]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Mozowhere</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Accessories Store</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            Browse ready-to-order accessories for gifting, teams and daily use.
          </p>
          <div className="mt-4 text-sm font-semibold text-slate-200">{filtered.length} items found</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "caps", label: "Caps" },
            { id: "mugs", label: "Mugs" },
            { id: "pens", label: "Pens" },
            { id: "other", label: "Other" },
          ].map((x) => (
            <button
              key={x.id}
              onClick={() => setType(x.id)}
              className={[
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition",
                type === x.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {x.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Loading accessories...
          </div>
        ) : err ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No accessories found. Add products with category/title like cap, mug, pen, accessory.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => {
              const price = Number(p?.discountPrice ?? p?.basePrice ?? 0);
              const image = p?.images?.[0] || "";
              return (
                <Link
                  key={p._id}
                  to={`/product/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="aspect-square bg-slate-100">
                    {image ? (
                      <img src={image} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs font-semibold text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="line-clamp-1 text-sm font-semibold text-slate-900">{p.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{p?.category?.name || "Accessories"}</div>
                    <div className="mt-3 text-base font-black text-slate-900">Rs {price}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
