import { Upload, Palette, Eye, ShoppingCart } from "lucide-react";

const STEPS = [
  { icon: Upload, title: "Upload Design", desc: "Upload your image or logo in any format", num: "01", gradient: "from-blue-500 to-indigo-600" },
  { icon: Palette, title: "Customize", desc: "Pick color, size, add text & position your design", num: "02", gradient: "from-purple-500 to-pink-600" },
  { icon: Eye, title: "Preview", desc: "See front & back preview before ordering", num: "03", gradient: "from-amber-500 to-orange-600" },
  { icon: ShoppingCart, title: "Order", desc: "Add to cart & get it delivered to your doorstep", num: "04", gradient: "from-emerald-500 to-teal-600" },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            Simple Process
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Create your custom product in just 4 easy steps
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STEPS.map((step) => (
            <div key={step.title} className="group relative rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -top-3 right-4 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {step.num}
              </div>
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}>
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
