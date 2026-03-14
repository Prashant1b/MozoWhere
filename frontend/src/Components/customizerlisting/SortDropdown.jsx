import React from "react";

export default function SortDropdown({ sort, setSort, options }) {
  return (
    <div className="flex items-center justify-end">
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-11 w-[260px] rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              Sort by : {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
