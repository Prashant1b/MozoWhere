import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        
        <h1 className="text-[120px] font-bold text-black leading-none">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mt-4">
          Oops! Page Not Found
        </h2>

      
        <p className="text-gray-500 mt-4">
          The page you’re looking for doesn’t exist or has been moved.
          Let’s get you back to shopping at Mozowhere.
        </p>

       
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go to Homepage
          </Link>

          <Link
            to="/category/t-shirts"
            className="px-6 py-3 border border-black rounded-lg hover:bg-black hover:text-white transition"
          >
            Shop T-Shirts
          </Link>
        </div>

        <p className="mt-12 text-sm tracking-widest text-gray-400">
          MOZOWHERE®
        </p>
      </div>
    </div>
  );
}