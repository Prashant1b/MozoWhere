import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { categoryApi } from "../api/category.api";

function CategoryCard({ title, slug, image }) {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(slug)}`}
      className="group relative min-h-[200px] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      aria-label={title}
    >
      {image ? (
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-2xl font-black text-slate-600">{title}</div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={10} className="text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">Trending</span>
          </div>
          <h3 className="text-lg font-black text-white">{title}</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default function TrendingCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await categoryApi.list({ trending: true });
        if (mounted) setCategories(res.data?.categories || []);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e?.message || "Failed to load categories");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const visible = useMemo(() => categories.filter((c) => c?.name && c?.slug), [categories]);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Popular Now</span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Trending Categories</h2>
            <p className="mt-2 text-sm text-slate-500">Most loved categories selected by your shoppers</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm">
            Explore All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[200px] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">{err}</div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
            No trending categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <CategoryCard key={c._id || c.slug} title={c.name} slug={c.slug} image={c.image} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
