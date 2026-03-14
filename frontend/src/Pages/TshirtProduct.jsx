import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../api/product.api";

function formatINR(n) {
  return `Rs ${String(n)}`;
}

function calcOff(mrp, price) {
  if (!mrp || !price) return null;
  const p = Math.round(((mrp - price) / mrp) * 100);
  return p > 0 ? p : null;
}

function ProductCard({ item }) {
  const navigate = useNavigate();
  const off = item.off ?? calcOff(item.mrp, item.price);

  return (
    <div
      onClick={() => navigate(`/product/${item.slug}`)}
      className="cursor-pointer flex-none w-[280px] sm:w-[320px] lg:w-[360px] bg-white border border-gray-200 rounded-sm overflow-hidden"
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        {item.badge && (
          <div className="absolute left-0 top-0 bg-emerald-500 text-white text-[11px] font-bold px-2 py-1">
            {item.badge}
          </div>
        )}

        {typeof item.rating === "number" && (
          <div className="absolute left-3 bottom-3 bg-white rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">{item.rating.toFixed(1)}</span>
          </div>
        )}

        {item.img ? (
          <img src={item.img} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900">{item.brand}</div>
            <div className="text-sm text-gray-600 truncate">{item.title}</div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="shrink-0 p-2 rounded-full hover:bg-gray-50"
            aria-label="wishlist"
          >
            <Heart className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-base font-extrabold text-gray-900">{formatINR(item.price)}</div>
          {item.mrp ? <div className="text-sm text-gray-400 line-through">{formatINR(item.mrp)}</div> : null}
          {off ? <div className="text-sm font-bold text-emerald-600">{off}% OFF</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function Product({ gender = "Men" }) {
  const railRef = useRef(null);
  const [items, setItems] = useState([]);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const g = String(gender).toLowerCase() === "women" ? "Female" : "Male";
        const res = await productApi.list({ gender: g, active: "true", limit: 50, sort: "-createdAt" });
        const products = res.data?.products || [];
        setItems(
          products.map((p) => ({
            id: p._id,
            slug: p.slug,
            brand: "Mozowhere",
            title: p.title,
            price: Number(p.discountPrice ?? p.basePrice ?? 0),
            mrp: Number(p.basePrice ?? 0),
            rating: 4.5,
            badge: "",
            img: p.images?.[0] || "",
          }))
        );
      } catch {
        setItems([]);
      }
    };
    load();
  }, [gender]);

  const list = useMemo(() => items, [items]);

  function updateButtons() {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }

  function scrollByCards(dir) {
    const el = railRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="w-full">
      <div className="bg-[#F6ECEC]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-center text-lg tracking-[0.22em] font-semibold text-gray-900">Tshirts</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          <button
            onClick={() => scrollByCards(-1)}
            disabled={!canLeft}
            className={[
              "hidden md:grid place-items-center",
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "h-11 w-11 rounded-full bg-white shadow border border-gray-200",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <button
            onClick={() => scrollByCards(1)}
            disabled={!canRight}
            className={[
              "hidden md:grid place-items-center",
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "h-11 w-11 rounded-full bg-white shadow border border-gray-200",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          <div
            ref={railRef}
            onScroll={updateButtons}
            onMouseEnter={updateButtons}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 pr-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {list.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          {list.length === 0 && (
            <div className="py-10 text-center text-gray-500">No products found for {gender}</div>
          )}
        </div>
      </div>
    </div>
  );
}