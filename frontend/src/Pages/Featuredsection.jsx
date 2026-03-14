import { ArrowRight, Star } from "lucide-react";
import megaSaleImg from "../assets/megasale.png";
import personImg from "../assets/person.png";
import dealImg from "../assets/men.png";
import { Link } from "react-router-dom";

const FeaturedSection = () => {
  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-amber-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
            Featured
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Deals & Highlights</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Mega Sale Banner */}
          <div
            className="group relative rounded-2xl overflow-hidden shadow-lg min-h-[240px] flex items-end transition-all hover:shadow-xl"
            style={{ backgroundImage: `url(${megaSaleImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="relative p-6 text-white w-full">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold backdrop-blur-sm border border-white/20">
                Limited Time Offer
              </span>
              <h3 className="mt-3 text-2xl font-black leading-tight">
                Mega Sale on Custom Prints
              </h3>
              <p className="mt-1.5 text-sm text-white/80">
                Best prices on T-Shirts & Accessories
              </p>
              <Link to="/custom-tshirts"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition shadow-lg">
                Start Designing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Review Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-4 items-start">
                <img src={personImg} alt="Customer" className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100" />
                <div className="flex-1">
                  <div className="flex gap-0.5 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "Great quality and super easy to customize. The print looks premium and delivery was fast!"
                  </p>
                  <p className="text-sm font-bold mt-3 text-slate-900">- Rohit S.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Trusted by Customers</p>
              <p className="text-sm text-slate-700 mt-1 font-medium">4.8/5 average rating for custom orders</p>
            </div>
          </div>

          {/* Deals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Offers</span>
                <h3 className="text-xl font-black text-slate-900">Popular Deals</h3>
              </div>
              <Link to="/shop" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                View All
              </Link>
            </div>

            <div className="relative rounded-xl overflow-hidden group">
              <img src={dealImg} alt="Deal" className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="text-white">
                  <p className="text-sm font-bold">Deal of the Day</p>
                  <p className="text-[11px] text-white/80">Extra discount on selected items</p>
                </div>
                <Link to="/shop"
                  className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-2 hover:shadow-lg transition">
                  Grab Deal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
