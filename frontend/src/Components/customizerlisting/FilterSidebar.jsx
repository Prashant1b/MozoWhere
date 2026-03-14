import React, { useMemo, useState } from "react";

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-[15px] font-extrabold text-gray-900">{title}</div>
        <div className="text-gray-600">{open ? "▴" : "▾"}</div>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[15px] text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-gray-300"
      />
      <span>{label}</span>
    </label>
  );
}

export default function FilterSidebar({
  filtersConfig,
  selected,
  setSelected,
  onClear,
}) {
  const count = useMemo(() => {
    let c = 0;
    Object.values(selected).forEach((setLike) => (c += setLike.size));
    return c;
  }, [selected]);

  function toggle(group, value) {
    setSelected((prev) => {
      const next = { ...prev };
      const s = new Set(next[group]);
      if (s.has(value)) s.delete(value);
      else s.add(value);
      next[group] = s;
      return next;
    });
  }

  return (
    <div className="rounded-xl bg-white">
      <div className="flex items-center justify-between pb-3">
        <div className="text-lg font-extrabold text-gray-900">
          Filters({count})
        </div>
        <button
          onClick={onClear}
          className="text-sm font-bold text-teal-600 hover:text-teal-700"
        >
          Clear All
        </button>
      </div>

      <Section title="Gender">
        {filtersConfig.gender.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.gender.has(v)}
            onChange={() => toggle("gender", v)}
          />
        ))}
      </Section>

      <Section title="Category">
        {filtersConfig.category.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.category.has(v)}
            onChange={() => toggle("category", v)}
          />
        ))}
      </Section>

      <Section title="Sizes">
        {filtersConfig.sizes.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.sizes.has(v)}
            onChange={() => toggle("sizes", v)}
          />
        ))}
      </Section>

      <Section title="Fit">
        {filtersConfig.fit.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.fit.has(v)}
            onChange={() => toggle("fit", v)}
          />
        ))}
      </Section>

      <Section title="Sleeve">
        {filtersConfig.sleeve.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.sleeve.has(v)}
            onChange={() => toggle("sleeve", v)}
          />
        ))}
      </Section>

      <Section title="Type">
        {filtersConfig.type.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.type.has(v)}
            onChange={() => toggle("type", v)}
          />
        ))}
      </Section>

      <Section title="Ratings">
        {filtersConfig.ratings.map((v) => (
          <Checkbox
            key={v}
            label={v}
            checked={selected.ratings.has(v)}
            onChange={() => toggle("ratings", v)}
          />
        ))}
      </Section>
    </div>
  );
}
