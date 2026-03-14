import React, { useRef } from "react";

export default function HScrollRow({ children }) {
  const ref = useRef(null);
  const scrollBy = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="relative">
      <button onClick={() => scrollBy(-800)} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl shadow">
        ‹
      </button>

      <div ref={ref} className="hide-scrollbar flex gap-4 overflow-x-auto px-8 py-1">
        {children}
      </div>

      <button onClick={() => scrollBy(800)} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl shadow">
        ›
      </button>
    </div>
  );
}