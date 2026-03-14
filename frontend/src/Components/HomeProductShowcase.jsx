import React, { useCallback, useEffect, useMemo, useState } from "react";
import { productApi } from "../api/product.api";
import { wishlistApi } from "../api/wishlist.api";
import ProductSection from "./shop/ProductSection";

function groupByCategory(products = []) {
  const map = new Map();
  for (const p of products) {
    const name = p?.category?.name || "Other";
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(p);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
}

function toApiGender(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "men" || v === "male") return "Male";
  if (v === "women" || v === "female") return "Female";
  return "";
}

export default function HomeProductShowcase({ selectedGender }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]);
  const [wishedIds, setWishedIds] = useState(new Set());

  const apiGender = useMemo(() => toApiGender(selectedGender), [selectedGender]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await productApi.list({
        limit: 300,
        sort: "-createdAt",
        active: "true",
        ...(apiGender ? { gender: apiGender } : {}),
      });
      setProducts(res.data?.products || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiGender]);

  // Fetch wishlist (silently fail if not logged in)
  useEffect(() => {
    wishlistApi.get()
      .then((res) => {
        const items = res.data?.wishlist?.products || res.data?.products || [];
        setWishedIds(new Set(items.map((i) => String(i._id || i.product?._id || i))));
      })
      .catch(() => {});
  }, []);

  const handleToggleWishlist = useCallback((productId, nowWished) => {
    setWishedIds((prev) => {
      const next = new Set(prev);
      if (nowWished) next.add(String(productId));
      else next.delete(String(productId));
      return next;
    });
  }, []);

  const sections = useMemo(() => {
    const grouped = groupByCategory(products);
    const order = ["Tshirts", "Hoodie", "Caps", "Accessories"];
    grouped.sort((a, b) => {
      const ia = order.indexOf(a.name);
      const ib = order.indexOf(b.name);
      if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return grouped.filter((s) => s.items?.length);
  }, [products]);

  return (
    <section className="w-full overflow-x-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-6 md:pt-8">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            Collections
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Shop By Category</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Premium picks curated for your style
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : err ? (
          <div className="py-10">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-center">{err}</div>
          </div>
        ) : (
          sections.map((sec) => (
            <ProductSection key={sec.name} title={sec.name} items={sec.items} wishedIds={wishedIds} onToggleWishlist={handleToggleWishlist} />
          ))
        )}
      </div>
    </section>
  );
}
