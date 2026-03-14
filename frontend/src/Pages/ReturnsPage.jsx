import React from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">Returns & Refunds</h1>
      <p className="mt-2 text-sm text-gray-600">Our hassle-free return policy ensures your satisfaction.</p>

      <div className="mt-8 space-y-5">
        {/* Policy Overview */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Clock className="h-5 w-5" />, title: "7 Day Returns", desc: "Return within 7 days of delivery" },
            { icon: <RotateCcw className="h-5 w-5" />, title: "Free Pickup", desc: "We arrange pickup at your doorstep" },
            { icon: <CheckCircle className="h-5 w-5" />, title: "Quick Refund", desc: "Refund in 5-7 business days" },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border bg-white p-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">{item.icon}</div>
              <h3 className="mt-2 text-sm font-bold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Eligible */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">Eligible for Returns</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Ready-made products (T-Shirts, Hoodies, Joggers, etc.)</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Wrong size received</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Damaged or defective product on arrival</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Wrong product delivered</li>
          </ul>
        </div>

        {/* Not Eligible */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">Not Eligible for Returns</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Custom printed products (unless manufacturing defect)</li>
            <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Products returned after 7 days</li>
            <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Used or washed products</li>
            <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Products without original tags and packaging</li>
          </ul>
        </div>

        {/* How to Return */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">How to Return</h2>
          <ol className="mt-3 space-y-3 text-sm text-gray-700">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">1</span> Contact us within 7 days of delivery at <a href="mailto:mozowhere@gmail.com" className="font-semibold underline">mozowhere@gmail.com</a> or call <a href="tel:+919123262970" className="font-semibold underline">+91 9123262970</a></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">2</span> Share your Order ID, product photos, and reason for return</li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">3</span> We'll approve and arrange a free pickup from your address</li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">4</span> Refund processed within 5-7 business days to original payment method</li>
          </ol>
        </div>

        <div className="text-center text-sm text-gray-600">
          Still have questions? <Link to="/contact" className="font-semibold text-black underline">Contact Us</Link> or check our <Link to="/faq" className="font-semibold text-black underline">FAQ</Link>
        </div>
      </div>
    </div>
  );
}
