import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail, ArrowRight, Navigation, Store } from "lucide-react";

const STORES = [
  {
    name: "MozoWhere - Greater Noida",
    address: "Chuharpur Khadar, Sector Chi 5 Road, Greater Noida, Uttar Pradesh",
    phone: "+91 9123262970",
    email: "mozowhere@gmail.com",
    hours: "Mon-Sat: 10:00 AM - 7:00 PM",
    closed: "Sunday: Closed",
    mapUrl: "https://maps.google.com/?q=Chuharpur+Khadar+Sector+Chi+5+Greater+Noida",
    isPrimary: true,
  },
];

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-10">
          <Store size={120} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Our Stores</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Find a Store Near You</h1>
          <p className="mt-2 text-base sm:text-lg opacity-90 max-w-xl">
            Visit us in person to see our products, try on sizes, and get help with custom orders.
          </p>
        </div>
      </div>

      {/* Store Cards */}
      <div className="mt-8 space-y-4">
        {STORES.map((store, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Store Icon */}
                <div className="grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Store size={32} />
                </div>

                {/* Store Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-extrabold text-gray-900">{store.name}</h2>
                      {store.isPrimary && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          Main Store
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold uppercase text-gray-400">Address</div>
                        <div className="mt-0.5 text-sm text-gray-700">{store.address}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold uppercase text-gray-400">Hours</div>
                        <div className="mt-0.5 text-sm text-gray-700">{store.hours}</div>
                        <div className="text-sm text-red-500 font-medium">{store.closed}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold uppercase text-gray-400">Phone</div>
                        <a href={`tel:${store.phone}`} className="mt-0.5 text-sm text-gray-700 hover:text-black transition">
                          {store.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold uppercase text-gray-400">Email</div>
                        <a href={`mailto:${store.email}`} className="mt-0.5 text-sm text-gray-700 hover:text-black transition">
                          {store.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
                    >
                      <Navigation size={16} /> Get Directions
                    </a>
                    <a
                      href={`tel:${store.phone}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50 transition"
                    >
                      <Phone size={16} /> Call Store
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Online shopping CTA */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-8 text-center">
        <h3 className="text-xl font-extrabold text-gray-900">Prefer Shopping Online?</h3>
        <p className="mt-1 text-sm text-gray-600">Browse our full collection and get it delivered to your doorstep.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition">
            Shop Online <ArrowRight size={14} />
          </Link>
          <Link to="/custom-tshirts"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 transition">
            Customize Products
          </Link>
        </div>
      </div>
    </div>
  );
}
