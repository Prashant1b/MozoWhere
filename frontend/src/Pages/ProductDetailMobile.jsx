import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productApi } from "../api/product.api";
import { cartApi } from "../api/cart.api";
import { wishlistApi } from "../api/wishlist.api";
import SizePill from "../Components/Product/SizePill";
import HScrollRow from "../Components/Product/HScrollRow";
import MiniProductCard from "../Components/Product/MiniProductCard";

function getOffPercent(base, disc) {
  if (!disc || !base) return 0;
  const p = Math.round(((base - disc) / base) * 100);
  return Number.isFinite(p) ? p : 0;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

function isAccessoryLikeProduct(product) {
  const text = [
    String(product?.title || "").toLowerCase(),
    String(product?.category?.name || "").toLowerCase(),
    String(product?.category?.slug || "").toLowerCase(),
    ...(Array.isArray(product?.tags) ? product.tags.map((t) => String(t).toLowerCase()) : []),
  ].join(" ");
  return ["cap", "mug", "pen", "jug", "bottle", "accessory", "accessories"].some((k) => text.includes(k));
}

export default function ProductDetailMobile() {
  const { slug } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  const [wishLoading, setWishLoading] = useState(false);
  const [isWished, setIsWished] = useState(false);

  const [suggested, setSuggested] = useState([]);
  const [toast, setToast] = useState("");
  const [showPlus, setShowPlus] = useState(false);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await productApi.detail(slug);
      const p = res.data?.product;
      const v = res.data?.variants || [];
      setProduct(p || null);
      setVariants(v);
      setImgIdx(0);
      setSelectedVariant(null);

      try {
        const wl = await wishlistApi.get();
        const ids = (wl.data?.wishlist?.products || []).map((x) => x._id?.toString?.() || x.toString?.());
        setIsWished(ids.includes(p?._id?.toString?.()));
      } catch {}

      if (p?.gender) {
        const sres = await productApi.list({ limit: 20, active: "true", gender: p.gender });
        setSuggested((sres.data?.products || []).filter((x) => x.slug !== slug).slice(0, 16));
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  const images = product?.images?.length ? product.images : [];
  const price = product ? product.discountPrice ?? product.basePrice : 0;
  const off = getOffPercent(product?.basePrice, product?.discountPrice);
  const shouldSkipSize = product?.sizeRequired === false || isAccessoryLikeProduct(product);
  const needsSizeSelection = !shouldSkipSize;

  const sizeItems = useMemo(() => {
    if (shouldSkipSize) return [];

    const map = new Map();
    for (const v of variants) {
      if (v.isActive === false) continue;
      const label = String(v.size || "").trim().toUpperCase();
      if (!label) continue;
      const prev = map.get(label);
      if (!prev || (v.stock ?? 0) > (prev.stock ?? 0)) map.set(label, v);
    }

    let arr = Array.from(map.entries()).map(([label, v]) => ({
      label,
      variant: v,
      inStock: (v.stock ?? 0) > 0,
    }));

    arr.sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a.label);
      const ib = SIZE_ORDER.indexOf(b.label);
      if (ia === -1 && ib === -1) return a.label.localeCompare(b.label);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return arr;
  }, [variants, shouldSkipSize]);

  const firstInStockVariant = useMemo(
    () => variants.find((v) => v?.isActive !== false && Number(v?.stock || 0) > 0) || null,
    [variants]
  );

  const onAddToBag = async () => {
    if (needsSizeSelection && !selectedVariant) {
      return showToast("Please select a size to continue");
    }
    try {
      setAdding(true);
      const variantToUse = selectedVariant || firstInStockVariant;
      if (variantToUse?._id) {
        await cartApi.add({ variantId: variantToUse._id, quantity: 1 });
      } else if (product?._id) {
        await cartApi.addProduct({ productId: product._id, quantity: 1 });
      } else {
        throw new Error("No variant available");
      }
      setShowPlus(true);
      setTimeout(() => setShowPlus(false), 900);
      showToast("Added to cart");
    } catch (e) {
      if (e?.response?.status === 401) {
        nav("/login", { state: { from: `/product/${slug}` } });
        return;
      }
      showToast(e?.response?.data?.message || e.message || "Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const onToggleWishlist = async () => {
    if (!product?._id) return;
    try {
      setWishLoading(true);
      await wishlistApi.toggle(product._id);
      setIsWished((x) => !x);
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Wishlist failed");
    } finally {
      setWishLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-sm text-gray-600">Loading...</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!product) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => nav(-1)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={onToggleWishlist}
          disabled={wishLoading}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            isWished ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {isWished ? "Wishlisted" : "Add to Wishlist"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[84px_1fr]">
            {images.length > 1 ? (
              <div className="order-2 flex gap-3 overflow-auto sm:order-1 sm:flex-col">
                {images.map((im, i) => (
                  <button
                    key={im + i}
                    onClick={() => setImgIdx(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${
                      i === imgIdx ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <img src={im} alt={`${product.title} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="order-1 overflow-hidden rounded-xl bg-gray-50 sm:order-2">
              <div className="relative h-[320px] w-full sm:h-[460px]">
                {images.length ? (
                  <img src={images[imgIdx]} alt={product.title} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                )}
                <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
                  4.5 Rating
                </div>
                {showPlus && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="animate-cart-plus rounded-full bg-black/80 px-5 py-3 text-2xl font-extrabold text-white">
                      +1
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mozowhere</div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">{product.title}</h1>

          <div className="mt-4 flex items-end gap-3">
            <div className="text-3xl font-black text-gray-900">Rs {price}</div>
            {product.discountPrice ? (
              <>
                <div className="text-lg text-gray-400 line-through">Rs {product.basePrice}</div>
                <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{off}% OFF</div>
              </>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-gray-500">Inclusive of all taxes</div>

          {needsSizeSelection ? (
            <>
              <div className="mt-6 flex items-end justify-between">
                <div className="text-sm font-bold text-gray-900">Select Size</div>
                <button className="text-xs font-semibold text-blue-600">Size guide</button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {sizeItems.map((s) => (
                  <SizePill
                    key={s.label}
                    label={s.label}
                    selected={selectedVariant?._id === s.variant?._id && !!s.variant}
                    disabled={!s.inStock || !s.variant}
                    onClick={() => s.variant && setSelectedVariant(s.variant)}
                  />
                ))}
              </div>

              {!selectedVariant ? <div className="mt-3 text-xs text-gray-500">Please select a size to continue</div> : null}
            </>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
              Size not required for this item
            </div>
          )}

          <button
            onClick={onAddToBag}
            disabled={adding}
            className="mt-6 h-12 w-full rounded-xl bg-black text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {adding ? "ADDING..." : "ADD TO CART"}
          </button>

          <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-gray-600">
            <div className="rounded-lg bg-gray-50 px-3 py-2">Free shipping on prepaid orders</div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">7 day return policy</div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">Cash on delivery available</div>
          </div>
        </aside>
      </div>

      <div className="mt-10">
        {suggested.length ? (
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Frequently Bought Together</h3>
              <span className="rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">NEW</span>
            </div>
            <div className="mt-4">
              <HScrollRow>
                {suggested.slice(0, 8).map((p) => (
                  <MiniProductCard key={p._id} p={p} />
                ))}
              </HScrollRow>
            </div>
          </div>
        ) : null}

        {suggested.length ? (
          <div className="mt-10">
            <h3 className="text-lg font-bold">You May Also Like</h3>
            <div className="mt-4">
              <HScrollRow>
                {suggested.slice(8, 16).map((p) => (
                  <MiniProductCard key={p._id} p={p} />
                ))}
              </HScrollRow>
            </div>
          </div>
        ) : null}
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm text-white">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
