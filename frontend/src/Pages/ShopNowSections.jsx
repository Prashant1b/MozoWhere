import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi } from "../api/product.api";
import ProductSection from "../Components/shop/ProductSection";
import { wishlistApi } from "../api/wishlist.api";
import { Search, SlidersHorizontal } from "lucide-react";

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

export default function ShopNowSections({ selectedGender }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]);
  const [wishedIds, setWishedIds] = useState(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || "";
  const [searchText, setSearchText] = useState("");

  const apiGender = useMemo(() => {
    const fromQuery = toApiGender(searchParams.get("cat"));
    return fromQuery || toApiGender(selectedGender);
  }, [searchParams, selectedGender]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await productApi.list({
        limit: 300,
        sort: "-createdAt",
        active: "true",
        ...(apiGender ? { gender: apiGender } : {}),
        ...(categorySlug ? { categorySlug } : {}),
      });
      setProducts(res.data?.products || []);
      try {
        const wl = await wishlistApi.get();
        const ids = (wl.data?.wishlist?.products || []).map((x) => String(x?._id || x));
        setWishedIds(new Set(ids));
      } catch {}
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiGender, categorySlug]);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return products;
    const q = searchText.toLowerCase();
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }, [products, searchText]);

  const sections = useMemo(() => {
    const grouped = groupByCategory(filtered);
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
  }, [filtered]);

  const categoryNames = useMemo(() => {
    const names = new Set();
    products.forEach((p) => {
      if (p?.category?.name) names.add(p.category.name);
    });
    return Array.from(names);
  }, [products]);

  const onToggleWishlist = (productId, nextWish) => {
    setWishedIds((prev) => {
      const next = new Set(prev);
      if (nextWish) next.add(String(productId));
      else next.delete(String(productId));
      return next;
    });
  };

  const totalProducts = filtered.length;

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#0b1220] to-[#1a2744] px-6 py-10 text-center sm:py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            SHOP NOW
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            {totalProducts} products available{categorySlug ? ` in ${categorySlug}` : ""}
          </p>

          {/* Search */}
          <div className="mx-auto mt-5 flex max-w-md items-center rounded-full bg-white/10 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur-sm">
            <Search className="h-4 w-4 text-gray-300" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search products..."
              className="ml-2 w-full bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category filter chips */}
      {categoryNames.length > 1 && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => { searchParams.delete("category"); setSearchParams(searchParams); }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                !categorySlug ? "bg-black text-white border-black" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {categoryNames.map((name) => (
              <button
                key={name}
                onClick={() => { searchParams.set("category", name.toLowerCase()); setSearchParams(searchParams); }}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  categorySlug === name.toLowerCase() ? "bg-black text-white border-black" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        ) : err ? (
          <div className="py-10">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-gray-700">No products found</p>
            <p className="mt-1 text-sm text-gray-500">Try a different search or category</p>
          </div>
        ) : (
          sections.map((sec) => (
            <ProductSection
              key={sec.name}
              title={sec.name}
              items={sec.items}
              wishedIds={wishedIds}
              onToggleWishlist={onToggleWishlist}
            />
          ))
        )}
      </div>
    </div>
  );
}
