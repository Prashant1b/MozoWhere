import React, { useEffect, useMemo, useState } from "react";

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  saving,
  initial,
}) {
  const isEdit = !!initial?._id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [gender, setGender] = useState("Male");
  const [sizeRequired, setSizeRequired] = useState(true);

  const [imagesText, setImagesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title || "");
    setSlug(initial?.slug || "");
    setDescription(initial?.description || "");
    setCategory(initial?.category?._id || initial?.category || "");

    setGender(initial?.gender || "Male");
    setSizeRequired(initial?.sizeRequired ?? true);

    setImagesText(Array.isArray(initial?.images) ? initial.images.join("\n") : "");
    setTagsText(Array.isArray(initial?.tags) ? initial.tags.join(", ") : "");
    setBasePrice(initial?.basePrice != null ? String(initial.basePrice) : "");
    setDiscountPrice(initial?.discountPrice != null ? String(initial.discountPrice) : "");
    setIsActive(initial?.isActive ?? true);
  }, [open, initial]);

  const payload = useMemo(() => {
    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      title,
      slug: slug || undefined,
      description,
      category,
      gender,
      sizeRequired,
      images,
      tags,
      basePrice: basePrice === "" ? undefined : Number(basePrice),
      discountPrice: discountPrice === "" ? undefined : Number(discountPrice),
      isActive,
    };
  }, [
    title,
    slug,
    description,
    category,
    gender,
    sizeRequired,
    imagesText,
    tagsText,
    basePrice,
    discountPrice,
    isActive,
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative mx-auto my-6 w-full max-w-2xl px-4">
        <div className="max-h-[85vh] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="font-extrabold text-gray-900">
              {isEdit ? "Edit Product" : "Create Product"}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100"
              aria-label="Close modal"
            >
              X
            </button>
          </div>

          <form
            className="flex-1 overflow-y-auto p-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(payload);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                  required
                />
              </Field>

              <Field label="Slug (optional)">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto from title if empty"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Gender">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="All">All</option>
                </select>
              </Field>

              <Field label="Base Price">
                <input
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  type="number"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                  required
                />
              </Field>

              <Field label="Category (_id OR slug/name)" span>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. tshirts OR 66c...objectId"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                  required
                />
              </Field>

              <Field label="Discount Price (optional)">
                <input
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  type="number"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="sizeRequired"
                  type="checkbox"
                  checked={sizeRequired}
                  onChange={(e) => setSizeRequired(e.target.checked)}
                />
                <label htmlFor="sizeRequired" className="text-sm font-semibold text-gray-700">
                  Size required for this product
                </label>
              </div>

              <Field label="Tags (comma separated)" span>
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="men, cotton, oversized"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Images (one URL per line)" span>
                <textarea
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  rows={4}
                  placeholder="https://.../img1.jpg"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
                />
              </Field>

              <Field label="Description" span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
                />
              </Field>
            </div>

            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-2 border-t border-gray-200 p-4 -mx-5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}