import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { productApi } from "../../api/product.api";
import { cartApi } from "../../api/cart.api";
import { wishlistApi } from "../../api/wishlist.api";

function getOffPercent(base, disc) {
  if (!disc || !base) return 0;
  const p = Math.round(((base - disc) / base) * 100);
  return Number.isFinite(p) ? p : 0;
}

export default function ProductCard({ p, isWished = false, onToggleWishlist }) {
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPlus, setShowPlus] = useState(false);

  const img = p?.images?.[0];
  const price = Number(p?.discountPrice ?? p?.basePrice ?? 0);
  const off = getOffPercent(p?.basePrice, p?.discountPrice);

  const quickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setAdding(true);
      setMsg("");
      const res = await productApi.detail(p.slug);
      const variants = res.data?.variants || [];
      const v = variants.find((x) => x?.isActive !== false && Number(x?.stock || 0) > 0);
      if (v?._id) {
        await cartApi.add({ variantId: v._id, quantity: 1 });
      } else if (p?._id) {
        await cartApi.addProduct({ productId: p._id, quantity: 1 });
      } else {
        setMsg("Out of stock");
        return;
      }
      // Show +1 animation
      setShowPlus(true);
      setTimeout(() => setShowPlus(false), 900);
      setMsg("Added to cart");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      if (err?.response?.status === 401) {
        nav("/login", { state: { from: "/shop" } });
        return;
      }
      setMsg(err?.response?.data?.message || "Add failed");
    } finally {
      setAdding(false);
    }
  };

  const quickWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setWishBusy(true);
      await wishlistApi.toggle(p._id);
      onToggleWishlist?.(p._id, !isWished);
    } catch (err) {
      if (err?.response?.status === 401) {
        nav("/login", { state: { from: "/shop" } });
        return;
      }
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <Link
      to={`/product/${p.slug}`}
      className="group relative w-[82vw] max-w-[292px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(2,6,23,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(2,6,23,0.12)] sm:w-[286px] lg:w-[300px]"
    >
      {/* Wishlist */}
      <button
        onClick={quickWish}
        disabled={wishBusy}
        className={[
          "absolute right-2 top-2 z-20 rounded-full border p-2 shadow-sm transition-transform active:scale-90",
          isWished ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-400 hover:text-red-400",
        ].join(" ")}
        aria-label="Toggle wishlist"
      >
        <Heart className="h-4 w-4" fill={isWished ? "currentColor" : "none"} />
      </button>

      {/* Discount badge */}
      {off > 0 && (
        <div className="absolute left-2 top-2 z-20 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          {off}% OFF
        </div>
      )}

      {/* Image */}
      <div className="relative h-[290px] bg-white p-2 sm:h-[330px]">
        {img ? (
          <img
            src={img}
            alt={p.title}
            className="h-full w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
        )}

        {/* +1 floating animation */}
        {showPlus && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="animate-cart-plus rounded-full bg-black/80 px-4 py-2 text-lg font-extrabold text-white">
              +1
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="border-t border-slate-200 px-4 py-3">
        <div className="line-clamp-1 text-[15px] font-semibold text-slate-900">{p.title}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="text-lg font-black text-slate-900">Rs {price}</div>
          {p.discountPrice ? (
            <div className="text-sm text-gray-400 line-through">Rs {Number(p.basePrice || 0)}</div>
          ) : null}
        </div>

        <button
          onClick={quickAdd}
          disabled={adding}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-bold tracking-wide text-white transition hover:bg-black active:scale-[0.97] disabled:opacity-60"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {adding ? "ADDING..." : "ADD TO CART"}
        </button>

        {msg ? (
          <div className={`mt-2 text-center text-[11px] font-medium ${msg === "Added to cart" ? "text-green-600" : "text-slate-600"}`}>
            {msg === "Added to cart" ? "✓ " : ""}{msg}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
