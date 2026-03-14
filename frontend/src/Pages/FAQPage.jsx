import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How do I place an order?", a: "Browse our products, select your size and color, add to cart, and proceed to checkout. You can pay via UPI, Card, Net Banking, or Cash on Delivery." },
      { q: "How long does delivery take?", a: "Standard delivery takes 5-7 business days. Custom printed products may take 7-10 business days as they are made to order." },
      { q: "Do you offer free shipping?", a: "Yes! Free shipping is available on all prepaid orders. COD orders may have a small additional charge." },
      { q: "How can I track my order?", a: "Go to Track Order page from your profile or the footer link. Enter your order details to see real-time tracking." },
    ],
  },
  {
    category: "Customization",
    items: [
      { q: "How does custom printing work?", a: "Use our online customizer to upload your design, add text, choose colors and placement. Preview your design on the product before ordering." },
      { q: "What file formats do you accept for designs?", a: "We accept PNG, JPG, and SVG files. For best results, use high-resolution PNG files with transparent backgrounds." },
      { q: "Can I order custom products in bulk?", a: "Yes! Visit our Bulk Orders page for discounted pricing on orders of 30+ pieces. We offer up to 40% off for large orders." },
      { q: "Can I customize accessories like mugs and caps?", a: "Yes! We offer customization for T-shirts, Hoodies, Caps, Mugs, and more through our Custom Accessories section." },
    ],
  },
  {
    category: "Returns & Payments",
    items: [
      { q: "What is your return policy?", a: "We offer a 7-day return policy for ready-made products. Custom printed items cannot be returned unless there is a manufacturing defect." },
      { q: "How do I return a product?", a: "Contact us within 7 days of delivery with your order ID and reason. We will arrange a pickup and process your refund." },
      { q: "What payment methods do you accept?", a: "We accept UPI, Debit/Credit Cards, Net Banking (via Razorpay), and Cash on Delivery." },
      { q: "When will I receive my refund?", a: "Refunds are processed within 5-7 business days after we receive the returned product." },
    ],
  },
  {
    category: "Account",
    items: [
      { q: "How do I create an account?", a: "Click Sign Up on the top right, enter your email and password. You can also sign up during checkout." },
      { q: "I forgot my password. What do I do?", a: "Contact us at mozowhere@gmail.com with your registered email and we will help you reset your password." },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="text-sm font-semibold text-gray-900 pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
      <p className="mt-2 text-sm text-gray-600">
        Can't find your answer? <Link to="/contact" className="font-semibold text-black underline">Contact us</Link>
      </p>

      <div className="mt-8 space-y-6">
        {FAQS.map((section) => (
          <div key={section.category} className="rounded-2xl border bg-white p-5">
            <h2 className="text-base font-bold text-gray-900 mb-1">{section.category}</h2>
            <div>
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
