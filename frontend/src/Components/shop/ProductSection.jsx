import React, { useRef } from "react";
import ProductCard from "./ProductCard";

export default function ProductSection({ title, items = [], wishedIds = new Set(), onToggleWishlist }) {
  const rowRef = useRef(null);

  const scrollBy = (dx) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dx, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="mt-10 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">{title}</h3>
          <p className="text-xs font-medium text-slate-500">Top picks in {title}</p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => scrollBy(-900)}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label={`Scroll ${title} left`}
          >
            {"<"}
          </button>
          <button
            onClick={() => scrollBy(900)}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label={`Scroll ${title} right`}
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        <div
          ref={rowRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5"
        >
          {items.map((p) => (
            <ProductCard
              key={p._id}
              p={p}
              isWished={wishedIds.has(String(p?._id))}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
