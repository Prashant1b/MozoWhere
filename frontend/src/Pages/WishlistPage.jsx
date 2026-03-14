import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wishlistApi } from "../api/wishlist.api";
import { productApi } from "../api/product.api";
import { cartApi } from "../api/cart.api";

function getOffPercent(base, disc) {
  if (!disc || !base) return 0;
  const p = Math.round(((base - disc) / base) * 100);
  return Number.isFinite(p) ? p : 0;
}

export default function WishlistPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await wishlistApi.get();
      setItems(res.data?.wishlist?.products || []);
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/login", { state: { from: "/wishlist" } });
        return;
      }
      setErr(e?.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(() => items.length, [items]);

  const removeFromWishlist = async (productId) => {
    try {
      setBusyId(productId);
      await wishlistApi.toggle(productId);
      setItems((prev) => prev.filter((p) => String(p?._id) !== String(productId)));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update wishlist");
    } finally {
      setBusyId("");
    }
  };

  const addToCart = async (product) => {
    if (!product?.slug) return;
    try {
      setBusyId(product._id);
      const res = await productApi.detail(product.slug);
      const variants = res.data?.variants || [];
      const v = variants.find((x) => x?.isActive !== false && Number(x?.stock || 0) > 0);
      if (!v?._id) {
        setErr("This product has no active in-stock variant");
        return;
      }
      await cartApi.add({ variantId: v._id, quantity: 1 });
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/login", { state: { from: "/wishlist" } });
        return;
      }
      setErr(e?.response?.data?.message || "Failed to add in cart");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-600">{total} saved item(s)</p>
        </div>
        <button onClick={load} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {err ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading wishlist...</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
          No products in wishlist. <Link className="font-semibold underline" to="/shop">Start shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const img = p?.images?.[0];
            const price = p?.discountPrice ?? p?.basePrice ?? 0;
            const off = getOffPercent(p?.basePrice, p?.discountPrice);
            const busy = busyId === String(p?._id);

            return (
              <div key={p._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Link to={`/product/${p.slug}`} className="block h-[240px] bg-gray-50">
                  {img ? <img src={img} alt={p.title} className="h-full w-full object-contain" /> : null}
                </Link>
                <div className="space-y-2 p-4">
                  <div className="line-clamp-1 text-sm font-semibold text-gray-900">{p?.title || "Product"}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-gray-900">Rs {price}</span>
                    {p?.discountPrice ? <span className="text-xs text-gray-400 line-through">Rs {p.basePrice}</span> : null}
                    {off > 0 ? <span className="text-xs font-bold text-emerald-700">{off}% OFF</span> : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={busy}
                      onClick={() => addToCart(p)}
                      className="h-10 rounded-lg bg-black text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {busy ? "PLEASE WAIT" : "ADD TO CART"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => removeFromWishlist(p._id)}
                      className="h-10 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
