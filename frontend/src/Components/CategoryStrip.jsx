import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { name: "T-Shirts", path: "/shop?category=tshirts", image: "/assets/tshirt-banner.png" },
  { name: "Joggers", path: "/shop?category=joggers", image: "/assets/joggers.png" },
  { name: "Customization", path: "/custom-tshirts", image: "/assets/tshirt-banner.png" },
  { name: "Customize Accessories", path: "/custom-accessories", image: "/assets/dtf.png" },
  { name: "Pants", path: "/shop?category=pants", image: "/assets/pants.png" },
  { name: "Accessories", path: "/accessories", image: "/assets/p7.png" },
  { name: "GenZ", path: "/shop?category=genz", image: "/assets/men.png" },
  { name: "Plain T-Shirts", path: "/shop?category=plain-tshirts", image: "/assets/tshirt-banner.png" },
  { name: "Gen Alpha", path: "/shop?category=gen-alpha", image: "/assets/woman-banner.png" },
];

export default function CategoryStrip() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 180;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    let scrollInterval;
    let pauseTimeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = container.querySelector("a")?.offsetWidth || 180;
          container.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
        }
      }, 4000);
    };

    startAutoScroll();

    const handleInteraction = () => {
      clearInterval(scrollInterval);
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(startAutoScroll, 6000);
    };

    container.addEventListener("touchstart", handleInteraction);
    container.addEventListener("mousedown", handleInteraction);

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(pauseTimeout);
      container.removeEventListener("scroll", updateScrollState);
      container.removeEventListener("touchstart", handleInteraction);
      container.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <section className="w-full bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            Shop by Category
          </h2>

          {/* Desktop arrow buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div className="relative">
          {/* Left fade */}
          {canScrollLeft && (
            <div className="hidden sm:block pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent" />
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="group relative flex-shrink-0 w-[140px] sm:w-[200px] lg:w-[220px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-black/10"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
                      <span className="text-sm font-bold text-slate-500">{cat.name}</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5">
                  <h3 className="text-sm sm:text-[15px] font-bold text-white leading-snug drop-shadow-sm">
                    {cat.name}
                  </h3>
                  <span className="mt-1 inline-flex items-center text-[11px] font-medium text-white/70 group-hover:text-white transition-colors">
                    Shop Now
                    <ChevronRight className="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right fade */}
          {canScrollRight && (
            <div className="hidden sm:block pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent" />
          )}
        </div>
      </div>
    </section>
  );
}
