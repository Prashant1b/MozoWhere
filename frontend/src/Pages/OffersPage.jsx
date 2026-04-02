import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { couponApi } from "../api/coupon.api";
import { Tag, Percent, IndianRupee, Clock, ShoppingCart, Copy, Check, Sparkles, ArrowRight } from "lucide-react";

function daysLeft(date) {
  const diff = new Date(date) - new Date();
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (d <= 0) return "Expired";
  if (d === 1) return "Expires tomorrow";
  if (d <= 7) return `${d} days left`;
  return `Valid till ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await couponApi.activeOffers();
        setOffers(res.data?.offers || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const gradients = [
    "from-indigo-600 to-purple-600",
    "from-emerald-600 to-teal-600",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-600",
    "from-blue-600 to-cyan-500",
    "from-violet-600 to-fuchsia-500",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M0%200h60v60H0z%22%20fill=%22none%22/%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22%20fill=%22rgba(255,255,255,0.07)%22/%3E%3C/svg%3E')]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-90">Special Offers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Deals & Discounts</h1>
          <p className="mt-2 text-base sm:text-lg opacity-90 max-w-xl">
            Grab exclusive coupon codes and save on your favorite custom products. Apply at checkout!
          </p>
          <Link to="/shop"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-900 hover:bg-gray-100 transition">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Active Coupon Codes</h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100 border border-gray-200" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <Tag className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No active offers right now</h3>
            <p className="mt-1 text-sm text-gray-500">Check back soon for new deals and discounts!</p>
            <Link to="/shop"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition">
              Browse Products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, idx) => {
              const gradient = gradients[idx % gradients.length];
              const isPercent = offer.discountType === "percent";
              const isCopied = copied === offer.code;

              return (
                <div key={offer._id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Colored top bar */}
                  <div className={`bg-gradient-to-r ${gradient} px-5 py-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPercent ? <Percent size={20} /> : <IndianRupee size={20} />}
                        <span className="text-2xl font-extrabold">
                          {isPercent ? `${offer.value}% OFF` : `Rs ${offer.value} OFF`}
                        </span>
                      </div>
                      <Tag size={18} className="opacity-60" />
                    </div>
                    {offer.maxDiscount && isPercent && (
                      <div className="mt-1 text-xs font-medium opacity-80">
                        Up to Rs {offer.maxDiscount} discount
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Coupon Code */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-center">
                        <span className="font-mono text-lg font-extrabold tracking-wider text-gray-900">
                          {offer.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCode(offer.code)}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
                          isCopied
                            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                        title="Copy code"
                      >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>

                    {/* Details */}
                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      {offer.minCartAmount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart size={12} className="text-gray-400" />
                          Min. order: Rs {offer.minCartAmount}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        {daysLeft(offer.expiryDate)}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to="/shop"
                      className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900 text-xs font-bold text-white hover:bg-gray-800 transition">
                      Shop Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extra Info */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 mb-3">
            <Tag size={22} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Apply at Checkout</h3>
          <p className="mt-1 text-xs text-gray-500">Enter the coupon code in your cart or checkout page to get the discount.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
            <Sparkles size={22} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Customize & Save</h3>
          <p className="mt-1 text-xs text-gray-500">Design your own t-shirts, hoodies, and accessories with exclusive offers.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600 mb-3">
            <ShoppingCart size={22} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Free Delivery</h3>
          <p className="mt-1 text-xs text-gray-500">Get free delivery on orders above the threshold for your area.</p>
        </div>
      </div>
    </div>
  );
}
