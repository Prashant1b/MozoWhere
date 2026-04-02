import React from "react";
import { Link } from "react-router-dom";
import { Palette, ArrowRight, Shirt, Star, Users, Sparkles } from "lucide-react";

const SHOWCASE = [
  {
    title: "Custom Band Tees",
    desc: "Fans designing their own concert merch with unique artwork.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    title: "College Fest Hoodies",
    desc: "Student groups creating matching hoodies for college events.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Wedding Party Tees",
    desc: "Bride & groom squads with personalized wedding tees.",
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "Startup Merch",
    desc: "Startups designing branded swag for their teams.",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Birthday Specials",
    desc: "Custom birthday t-shirts with photos and fun messages.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Sports Team Jerseys",
    desc: "Local teams creating custom jerseys with names and numbers.",
    color: "from-amber-500 to-yellow-600",
  },
];

const TESTIMONIALS = [
  {
    name: "Riya S.",
    text: "Designed custom tees for my entire wedding party. The quality was amazing and everyone loved them!",
    rating: 5,
  },
  {
    name: "Aman K.",
    text: "We ordered bulk hoodies for our startup team. The printing quality and fabric were top-notch.",
    rating: 5,
  },
  {
    name: "Priya M.",
    text: "The customizer tool is so easy to use. I created a birthday tee for my friend in minutes!",
    rating: 4,
  },
];

export default function FanbookPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-10">
          <Palette size={120} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Community</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Fanbook</h1>
          <p className="mt-2 text-base sm:text-lg opacity-80 max-w-xl">
            See what our community is creating! Get inspired by real custom designs from MozoWhere fans.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/custom-tshirts"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFD23D] px-5 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-300 transition">
              <Palette size={16} /> Start Designing <ArrowRight size={14} />
            </Link>
            <Link to="/bulk-order"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition">
              Bulk Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-10">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">What People Are Creating</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((item, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow group">
              <div className={`bg-gradient-to-br ${item.color} h-36 flex items-center justify-center relative`}>
                <Shirt size={56} className="text-white/30" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                <Link to="/custom-tshirts"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
                  Try it yourself <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-10">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">What Our Fans Say</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} className={s < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-sm text-gray-700 italic">"{t.text}"</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 grid place-items-center text-white text-xs font-bold">
                  {t.name[0]}
                </div>
                <span className="text-sm font-semibold text-gray-900">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-8 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-indigo-600 mb-3" />
        <h3 className="text-xl font-extrabold text-gray-900">Ready to Create Your Own?</h3>
        <p className="mt-1 text-sm text-gray-600">Design custom t-shirts, hoodies, caps, and more with our easy-to-use customizer.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/custom-tshirts"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">
            <Palette size={16} /> Customize Now
          </Link>
          <Link to="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 transition">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
