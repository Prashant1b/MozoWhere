export const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export function percentOff(mrp, price) {
  if (!mrp || !price) return null;
  const p = Math.round(((mrp - price) / mrp) * 100);
  return p > 0 ? p : null;
}
