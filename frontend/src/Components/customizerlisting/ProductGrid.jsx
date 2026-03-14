// src/Components/customizerlisting/ProductGrid.jsx
import React from "react";

export default function ProductGrid({ products = [], onProductClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onProductClick?.(p)}
          className="text-left rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition bg-white"
        >
          <div className="aspect-square bg-gray-50">
            <img
              src={p.image}
              alt={p.title}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          <div className="p-3">
            <div className="font-bold text-sm line-clamp-1">{p.title}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {p.type} • {p.category}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="font-extrabold">₹{p.price}</div>
              {p.mrp ? <div className="text-xs text-gray-400 line-through">₹{p.mrp}</div> : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
