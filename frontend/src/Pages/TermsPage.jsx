import React from "react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">1. General</h2>
          <p className="mt-2">By using Mozowhere ("we", "us", "our"), you agree to these Terms & Conditions. These terms apply to all users of the website and services.</p>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">2. Products & Pricing</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>All prices are listed in Indian Rupees (INR) and include applicable taxes.</li>
            <li>We reserve the right to change prices at any time without prior notice.</li>
            <li>Product images are for illustration. Actual colors may vary slightly due to screen settings.</li>
            <li>Custom printed products are made to order and may have slight variations from the preview.</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">3. Orders</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>An order is confirmed only after successful payment or COD confirmation.</li>
            <li>We reserve the right to cancel orders in case of stock unavailability or pricing errors.</li>
            <li>Order cancellation is allowed before the product is shipped.</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">4. Custom Designs</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You are responsible for the content of designs you upload. Do not upload copyrighted or offensive material.</li>
            <li>We reserve the right to refuse printing designs that violate copyright, trademark, or contain offensive content.</li>
            <li>Custom printed products cannot be returned unless there is a manufacturing defect.</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">5. Shipping & Delivery</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>We deliver across India. Delivery timelines are estimates and may vary.</li>
            <li>Standard delivery: 5-7 business days. Custom products: 7-10 business days.</li>
            <li>Shipping charges may apply for COD orders.</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">6. Returns & Refunds</h2>
          <p className="mt-2">Please refer to our <a href="/returns" className="font-semibold underline">Returns & Refunds Policy</a> for detailed information on returns, exchanges, and refund processing.</p>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">7. Account</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>We may suspend accounts that violate these terms or engage in fraudulent activity.</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">8. Contact</h2>
          <p className="mt-2">For questions about these terms, contact us at <a href="mailto:mozowhere@gmail.com" className="font-semibold underline">mozowhere@gmail.com</a> or call <a href="tel:+919123262970" className="font-semibold underline">+91 9123262970</a>.</p>
        </section>
      </div>
    </div>
  );
}
