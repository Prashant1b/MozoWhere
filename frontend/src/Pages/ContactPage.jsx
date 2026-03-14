import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">Contact Us</h1>
      <p className="mt-2 text-sm text-gray-600">Have a question? We'd love to hear from you.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="rounded-2xl border bg-white p-6">
          {sent ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Message Sent!</h2>
              <p className="mt-2 text-sm text-gray-600">We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Name</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} required
                    className="mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Email</label>
                  <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" required
                    className="mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="you@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Phone (optional)</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric"
                  className="mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="10 digit number" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Message</label>
                <textarea value={form.message} onChange={(e) => set("message", e.target.value)} required rows={5}
                  className="mt-1 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="h-11 w-full rounded-xl bg-black text-sm font-bold text-white hover:bg-gray-800">
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-bold text-gray-900">Get in Touch</h3>
            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <a href="tel:+919123262970" className="flex items-center gap-3 hover:text-black transition">
                <Phone className="h-4 w-4 text-gray-400" /> +91 9123262970
              </a>
              <a href="mailto:mozowhere@gmail.com" className="flex items-center gap-3 hover:text-black transition">
                <Mail className="h-4 w-4 text-gray-400" /> mozowhere@gmail.com
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span>Chuharpur Khadar, Sector Chi 5 Road, Greater Noida, Uttar Pradesh</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-bold text-gray-900">Business Hours</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between"><span>Monday - Saturday</span><span className="font-semibold">10:00 AM - 7:00 PM</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-semibold text-red-500">Closed</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
