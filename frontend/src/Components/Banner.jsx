import React from "react";
import { Link } from "react-router-dom";
import menImg from "../assets/man-banner.png";
import womenImg from "../assets/woman-banner.png";
import tshirtImg from "../assets/tshirt-banner.png";
import dtfImg from "../assets/dtf.png";

export default function MainBanner() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f9fb] to-[#eef1f6]">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative py-10 sm:py-14 lg:py-10 lg:min-h-[480px]">

                    {/* CENTER CONTENT */}
                    <div className="relative z-10 mx-auto max-w-3xl text-center text-gray-900">

                        <p className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-4 py-2 text-[12px] font-semibold text-yellow-700">
                            Custom T-Shirts • Accessories
                        </p>

                        <h1 className="mt-5 text-[28px] sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                            Design Your Own
                            <br />
                            <span className="text-gray-900">T-Shirts & Accessories</span>
                        </h1>

                        <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                            Upload your design, choose front/back/both, add name text and preview in 3D.
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 lg:hidden">
                            <Link
                                to="/custom-tshirts"
                                className="w-full sm:w-auto rounded-xl bg-[#FFD23D] px-6 py-3 text-sm font-bold text-black shadow hover:bg-[#ffcf2a] transition"
                            >
                                Start Designing
                            </Link>

                            <Link
                                to="/shop"
                                className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 transition"
                            >
                                Explore product
                            </Link>
                        </div>
                    </div>

                    {/* DESKTOP MODELS */}
                    <img
                        src={menImg}
                        alt="Man model"
                        className="hidden lg:block absolute right-230 bottom-0 w-[340px] object-contain"
                    />

                    <img
                        src={womenImg}
                        alt="Woman model"
                        className="hidden lg:block absolute left-230 bottom-0 w-[340px] object-contain"
                    />

                    {/* DESKTOP CARDS */}
                    <div className="hidden lg:flex absolute left-1/2 bottom-12 -translate-x-1/2 gap-6">
                        <div className="rounded-2xl bg-white shadow-lg px-6 py-5 flex flex-col items-center">
                            <img src={tshirtImg} alt="T-shirt" className="h-20 object-contain" />
                            <p className="mt-2 text-sm font-semibold text-gray-700">
                                Custom T-Shirt
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white shadow-lg px-6 py-5 flex flex-col items-center">
                            <img src={dtfImg} alt="accessories" className="h-20 object-contain" />
                            <p className="mt-2 text-sm font-semibold text-gray-700">
                                Accessories
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
