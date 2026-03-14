import React from "react";

export default function ListingHeader({ total, onOpenFilters }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13px] text-gray-500">
          Home <span className="mx-1">›</span> Clothing{" "}
          <span className="mx-1">›</span> Custom T-Shirts
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Customized T shirts
          </h1>
          <span className="text-gray-500">{total} Products</span>
        </div>
      </div>

      {/* Mobile Filters Button */}
      <button
        onClick={onOpenFilters}
        className="lg:hidden rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      >
        Filters
      </button>
    </div>
  );
}
