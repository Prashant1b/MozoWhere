import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";

const FEATURES = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above Rs.499", color: "from-blue-500 to-indigo-600" },
  { icon: Shield, title: "Premium Quality", desc: "100% cotton & durable prints", color: "from-emerald-500 to-teal-600" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy", color: "from-amber-500 to-orange-600" },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help", color: "from-purple-500 to-pink-600" },
];

export default function TrustBar() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-sm`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 sm:text-sm">{f.title}</p>
                <p className="text-[10px] text-slate-500 sm:text-[11px]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
