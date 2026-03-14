import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { cartApi } from "../../api/cart.api";
import { productApi } from "../../api/product.api";

function getOffPercent(base, disc) {
  if (!disc || !base) return 0;
  const p = Math.round(((base - disc) / base) * 100);
  return Number.isFinite(p) ? p : 0;
}

async function addFirstVariantToBag(slug, productId) {
  const res = await productApi.detail(slug);
  const variants = res.data?.variants || [];
  const first = variants.find((v) => v.isActive !== false && (v.stock ?? 0) > 0);
  if (first?._id) {
    await cartApi.add({ variantId: first._id, quantity: 1 });
  } else if (productId) {
    await cartApi.addProduct({ productId, quantity: 1 });
  } else {
    throw new Error("Out of stock");
  }
}

export default function MiniProductCard({ p }) {
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [msg, setMsg] = useState("");
  const price = p?.discountPrice ?? p?.basePrice;
  const off = getOffPercent(p?.basePrice, p?.discountPrice);
  const img = p?.images?.[0];

  const onAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      setMsg("");
      await addFirstVariantToBag(p.slug, p._id);
      setShowPlus(true);
      setTimeout(() => setShowPlus(false), 900);
      setMsg("Added");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      if (err?.response?.status === 401) {
        nav("/login", { state: { from: `/product/${p.slug}` } });
        return;
      }
      setMsg(err?.response?.data?.message || err.message || "Failed");
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/product/${p.slug}`} className="w-[230px] shrink-0">
      <div className="relative overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-[220px] bg-white">
          {img ? (
            <img src={img} alt={p.title} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
          )}

          {off > 0 && (
            <div className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {off}% OFF
            </div>
          )}

          {showPlus && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="animate-cart-plus rounded-full bg-black/80 px-4 py-2 text-lg font-extrabold text-white">
                +1
              </span>
            </div>
          )}
        </div>

        <div className="px-3 pb-3 pt-2">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mozowhere</div>
          <div className="line-clamp-1 text-sm font-medium text-gray-800">{p.title}</div>

          <div className="mt-1.5 flex items-center gap-2">
            <div className="font-bold text-gray-900">Rs {price}</div>
            {p.discountPrice ? (
              <div className="text-xs text-gray-400 line-through">Rs {p.basePrice}</div>
            ) : null}
          </div>

          <button
            onClick={onAdd}
            disabled={adding}
            className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-xs font-bold text-white transition hover:bg-black active:scale-[0.97] disabled:opacity-60"
          >
            <ShoppingBag className="h-3 w-3" />
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          {msg && (
            <div className={`mt-1.5 text-center text-[10px] font-medium ${msg === "Added" ? "text-green-600" : "text-red-500"}`}>
              {msg === "Added" ? "✓ " : ""}{msg}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
