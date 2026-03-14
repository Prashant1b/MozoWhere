import React from "react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
          <p className="mt-2">When you use Mozowhere, we collect the following information:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><b>Personal Information:</b> Name, email address, phone number, shipping address when you create an account or place an order.</li>
            <li><b>Payment Information:</b> Payment details are processed securely through Razorpay. We do not store your card numbers.</li>
            <li><b>Design Data:</b> Custom designs you upload for printing are stored securely to fulfill your orders.</li>
            <li><b>Usage Data:</b> Browser type, pages visited, and general usage patterns to improve our service.</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">2. How We Use Your Information</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>To process and deliver your orders</li>
            <li>To communicate about order status and updates</li>
            <li>To provide customer support</li>
            <li>To send promotional offers (only with your consent)</li>
            <li>To improve our products and services</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">3. Data Security</h2>
          <p className="mt-2">We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted and processed through Razorpay's secure payment gateway.</p>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">4. Data Sharing</h2>
          <p className="mt-2">We do not sell your personal information. We share data only with:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Shipping partners (to deliver your orders)</li>
            <li>Payment processors (Razorpay, for secure transactions)</li>
            <li>Law enforcement (if required by law)</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">5. Your Rights</h2>
          <p className="mt-2">You have the right to access, update, or delete your personal information. Contact us at <a href="mailto:mozowhere@gmail.com" className="font-semibold underline">mozowhere@gmail.com</a> for any data-related requests.</p>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">6. Contact</h2>
          <p className="mt-2">For privacy-related questions, contact us at <a href="mailto:mozowhere@gmail.com" className="font-semibold underline">mozowhere@gmail.com</a> or call <a href="tel:+919123262970" className="font-semibold underline">+91 9123262970</a>.</p>
        </section>
      </div>
    </div>
  );
}
