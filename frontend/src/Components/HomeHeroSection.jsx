import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Palette, ShoppingBag, Sparkles } from "lucide-react";
import { serviceApi } from "../api/service.api";

const ICON_MAP = { shop: ShoppingBag, custom: Sparkles, accessories: Palette, bulk: Boxes };
const GRADIENT_MAP = {
  shop: "from-slate-800 to-slate-900",
  custom: "from-indigo-600 to-purple-700",
  accessories: "from-emerald-600 to-teal-700",
  bulk: "from-amber-600 to-orange-700",
};

const FALLBACK_CARDS = [
  { name: "Shop Now", subtitle: "Ready products for instant order", path: "/shop", slug: "shop" },
  { name: "Customization", subtitle: "Design T-shirts and hoodies", path: "/custom-tshirts", slug: "custom" },
  { name: "Customize Accessories", subtitle: "Mugs, caps, pen and more", path: "/custom-accessories", slug: "accessories" },
  { name: "Bulk Orders", subtitle: "Corporate and event quantity pricing", path: "/bulk-order", slug: "bulk" },
];

export default function HomeHeroCarousel() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await serviceApi.listPublic();
        if (mounted) setServices(res.data?.services || []);
      } catch {
        if (mounted) setServices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const cards = services.length > 0 ? services : FALLBACK_CARDS;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 md:pb-10">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Our Services</span>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">What We Offer</h2>
          <p className="mt-2 text-sm text-slate-500">Shop instantly or launch custom orders in a few clicks</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((card, idx) => {
            const Icon = ICON_MAP[card.slug] || ShoppingBag;
            const gradient = GRADIENT_MAP[card.slug] || "from-slate-800 to-slate-900";
            const hasImage = !!card.image;

            return (
              <Link
                key={card._id || card.slug || idx}
                to={card.path || "/"}
                className="group relative min-h-[200px] overflow-hidden rounded-2xl p-5 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-white"
                style={hasImage ? { backgroundImage: `url(${card.image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {hasImage && <div className="absolute inset-0 bg-black/50 rounded-2xl" />}
                {!hasImage && <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl`} />}

                <div className="relative flex h-full flex-col justify-between z-10">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-black leading-tight">{card.name}</h3>
                    <p className="mt-1.5 text-xs opacity-80 leading-relaxed">{card.subtitle}</p>
                  </div>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold opacity-80 group-hover:opacity-100 transition">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
