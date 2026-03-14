import React from "react";

export default function SizePill({ label, selected, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-w-[52px] rounded-xl border px-4 py-3 text-sm font-semibold",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-gray-50",
        selected ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-900",
      ].join(" ")}
    >
      {label}
    </button>
  );
}