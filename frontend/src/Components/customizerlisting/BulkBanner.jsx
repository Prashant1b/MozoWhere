import React from "react";
import tshirtImg from "../../assets/tshirt-banner.png";
import {Link} from "react-router-dom"
export default function BulkBanner() {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#121212] to-[#2a2a2a]">
      <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-6 px-6 py-10">
        <div className="text-white">
          <div className="text-3xl md:text-4xl font-light">
            Enquire about <span className="font-extrabold">Bulk Orders</span> at
          </div>

          <Link to="/bulk-order" className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-3 text-lg font-semibold text-gray-900">
            Bulk Order
          </Link>

          <div className="mt-6 text-sm text-white/80">
            *Min. 30 units order <span className="mx-3">|</span> Grab exciting
            deals & offers
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -right-14 -bottom-20 h-[340px] w-[520px] rotate-6 rounded-3xl bg-white/5" />
          <img
            alt="shirts"
            className="relative ml-auto w-[420px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
            src={tshirtImg} />
        </div>
      </div>
    </div>
  );
}
