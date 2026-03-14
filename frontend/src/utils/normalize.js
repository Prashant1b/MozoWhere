import { percentOff } from "./helpers";

function pickRelated(all, currentId, n, tag) {
  const pool = (all || [])
    .filter((x) => String(x.id) !== String(currentId))
    .slice(0, n);

  return pool.map((x, idx) => ({
    id: `${x.id}-${idx}`,
    brand: x.brand ?? "Mozowhere®",
    title: x.title ?? "Suggested Product",
    img: x.img ?? "/placeholder.jpg",
    price: x.price ?? 399,
    mrp: x.mrp ?? 749,
    off: x.off ?? null,
    rating: typeof x.rating === "number" ? x.rating : 4.5,
    tag,
  }));
}

export function normalizeProduct(p, all) {
  if (!p) return null;

  const images =
    Array.isArray(p.images) && p.images.length
      ? p.images
      : p.img
      ? [p.img, p.img, p.img, p.img, p.img]
      : ["/placeholder.jpg"];

  return {
    id: p.id,
    brand: p.brand ?? "Mozowhere®",
    title: p.title ?? "Product Title",
    img: p.img ?? images[0],

    images,
    price: p.price ?? 899,
    mrp: p.mrp ?? 1599,
    off: p.off ?? percentOff(p.mrp, p.price),

    tag: p.tag ?? "RELAXED FIT",
    rating: typeof p.rating === "number" ? p.rating : 4.4,
    ratingCount: p.ratingCount ?? 446,

    lowAs: p.lowAs ?? 766,
    boughtRecently: p.boughtRecently ?? 113,
    fabricTag: p.fabricTag ?? "Premium Blended Fabric",

    sizes:
      Array.isArray(p.sizes) && p.sizes.length
        ? p.sizes
        : [
            { label: "XS" },
            { label: "S" },
            { label: "M" },
            { label: "L" },
            { label: "XL" },
            { label: "2XL" },
            { label: "3XL", disabled: true },
          ],

    offers:
      Array.isArray(p.offers) && p.offers.length
        ? p.offers
        : [
            {
              title: "Get EXTRA 10% Cashback on all products above Rs.499...",
              code: "GETCASH10",
            },
            { title: "Flat ₹100 off on first order above ₹999", code: "WELCOME100" },
          ],

    highlights:
      Array.isArray(p.highlights) && p.highlights.length
        ? p.highlights
        : [
            { label: "Design", value: "Solid" },
            { label: "Fit", value: "Relaxed Fit" },
            { label: "Waist Rise", value: "Mid-Rise" },
            { label: "Distress", value: "Clean Look" },
            { label: "Occasion", value: "Casual Wear" },
            { label: "Closure", value: "Elasticated" },
          ],

    description:
      p.description ??
      "A premium everyday essential designed for comfort. Soft feel, great fit and easy styling.",

    ratingBars:
      Array.isArray(p.ratingBars) && p.ratingBars.length
        ? p.ratingBars
        : [
            { star: 5, pct: 70, count: 246 },
            { star: 4, pct: 45, count: 147 },
            { star: 3, pct: 20, count: 53 },
            { star: 2, pct: 0, count: 0 },
            { star: 1, pct: 0, count: 0 },
          ],

    reviews:
      Array.isArray(p.reviews) && p.reviews.length
        ? p.reviews
        : [
            {
              stars: 5,
              text: "LOVED the fit. Looks so good. Exactly like the picture!",
              name: "AVNI",
              date: "6 October 2024",
            },
            {
              stars: 4,
              text: "Good quality and comfortable. Delivery was quick.",
              name: "Riya",
              date: "12 November 2024",
            },
          ],

    fbt: pickRelated(all, p.id, 6, "BOYFRIEND FIT"),
    related: pickRelated(all, p.id, 8, "SUPER LOOSE FIT"),
  };
}
