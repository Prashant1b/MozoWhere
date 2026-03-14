import React, { useEffect, useMemo, useState } from "react";
import { bulkOrderApi } from "../api/bulkOrder.api";
import { CheckCircle, Upload, Package, Users, Truck, Phone } from "lucide-react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PRODUCTS = [
  { id: "tshirt", label: "T-Shirt", price: 349, icon: "👕" },
  { id: "hoodie", label: "Hoodie", price: 499, icon: "🧥" },
  { id: "polo", label: "Polo T-Shirt", price: 399, icon: "👔" },
  { id: "jogger", label: "Jogger", price: 449, icon: "👖" },
  { id: "cap", label: "Cap / Accessories", price: 199, icon: "🧢" },
];

const CLOTH_OPTIONS = [
  { id: "standard", label: "Standard" },
  { id: "cotton", label: "100% Cotton" },
  { id: "premium_cotton", label: "Premium Cotton" },
  { id: "poly_cotton", label: "Poly Cotton" },
  { id: "dri_fit", label: "Dri-Fit" },
  { id: "fleece", label: "Fleece" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#111827" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Red", hex: "#dc2626" },
  { name: "Grey", hex: "#6b7280" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Green", hex: "#166534" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Sky Blue", hex: "#38bdf8" },
  { name: "Orange", hex: "#ea580c" },
];

const PLACEMENTS = [
  { id: "front", label: "Front Only" },
  { id: "back", label: "Back Only" },
  { id: "both", label: "Front + Back" },
  { id: "custom", label: "Custom Placement" },
];

export default function BulkOrder() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);

  // Step 1 - Contact
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  // Step 2 - Product
  const [product, setProduct] = useState("");
  const [clothOption, setClothOption] = useState("standard");
  const [quantity, setQuantity] = useState(0);
  const [sizeBreakdown, setSizeBreakdown] = useState({});
  const [selectedColors, setSelectedColors] = useState([]);
  const [printPlacement, setPrintPlacement] = useState("front");

  // Step 3 - Designs & notes
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const basePrices = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.price]));

  const getDiscount = (qty) => {
    if (qty >= 500) return 0.4;
    if (qty >= 300) return 0.3;
    if (qty >= 100) return 0.2;
    if (qty >= 50) return 0.1;
    if (qty >= 30) return 0.05;
    return 0;
  };

  const discount = useMemo(() => getDiscount(quantity || 0), [quantity]);
  const basePrice = useMemo(() => (product ? basePrices[product] || 0 : 0), [product]);
  const unitPrice = useMemo(() => (!product || !quantity ? 0 : Math.round(basePrice * (1 - discount))), [product, quantity, basePrice, discount]);
  const totalPrice = useMemo(() => (!product || !quantity ? 0 : unitPrice * quantity), [product, quantity, unitPrice]);
  const canCalculate = Boolean(product) && quantity > 0;

  const totalSizeQty = useMemo(() => Object.values(sizeBreakdown).reduce((a, b) => a + (Number(b) || 0), 0), [sizeBreakdown]);

  const step1Valid = name.trim() && /^\d{10}$/.test(phone.trim()) && email.trim();
  const step2Valid = product && quantity > 0;
  const step3Valid = images.length > 0;
  const canSubmit = step1Valid && step2Valid && step3Valid;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files].slice(0, 8));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const updateSizeQty = (size, val) => {
    const num = Math.max(0, Number(val) || 0);
    setSizeBreakdown((prev) => ({ ...prev, [size]: num }));
  };

  useEffect(() => {
    return () => {
      images.forEach((file) => {
        try { URL.revokeObjectURL(file.previewUrl); } catch {}
      });
    };
  }, [images]);

  const onSubmitBulk = async () => {
    if (!canSubmit || submitting) return;
    setSubmitMsg("");
    setSubmitting(true);
    try {
      const payloadImages = [];
      for (const f of images) {
        const dataUrl = await fileToDataUrl(f);
        payloadImages.push({ name: f.name, mimeType: f.type, size: f.size, dataUrl });
      }

      const sizeArr = Object.entries(sizeBreakdown)
        .filter(([, q]) => Number(q) > 0)
        .map(([size, q]) => ({ size, quantity: Number(q) }));

      await bulkOrderApi.create({
        name, phone, company, email, notes, product, clothOption, quantity,
        sizeBreakdown: sizeArr,
        colors: selectedColors,
        printPlacement,
        deliveryDate: deliveryDate || undefined,
        pricing: { basePrice, discountPercent: Math.round(discount * 100), unitPrice, totalPrice },
        images: payloadImages,
      });

      setSubmitted(true);
    } catch (e) {
      setSubmitMsg(e?.response?.data?.message || "Failed to submit bulk order");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4">
        <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Request Submitted!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you <b>{name}</b>! We have received your bulk order request for <b>{quantity} {PRODUCTS.find((p) => p.id === product)?.label || product}</b>.
          </p>
          <div className="mt-4 rounded-xl bg-gray-50 border p-3 text-left text-sm text-gray-700">
            <p className="font-semibold">What happens next?</p>
            <ul className="mt-2 space-y-1 list-disc pl-5 text-gray-600">
              <li>Our team will review your design within 24 hours</li>
              <li>We will call you on <b>{phone}</b> to confirm details</li>
              <li>You will receive a final quotation on <b>{email}</b></li>
              <li>Production starts after your approval</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 h-11 w-full rounded-xl bg-black text-sm font-bold text-white hover:bg-gray-800"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  const stepItems = [
    { num: 1, label: "Contact Info" },
    { num: 2, label: "Product Details" },
    { num: 3, label: "Design & Submit" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-black to-gray-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-wider text-gray-300">Bulk Custom Printing</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 leading-tight">
              Bulk Orders Made Simple
            </h1>
            <p className="text-gray-300 mt-3 text-base md:text-lg">
              Perfect for colleges, companies, events, teams and organizations.
              Get instant bulk pricing with discounts up to 40%.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#bulk-form" className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition text-sm">
                Start Bulk Order
              </a>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><Package className="h-4 w-4" /> Min 10 pcs</span>
                <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Free Shipping 100+</span>
                <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { step: "1", title: "Choose Product", desc: "T-shirt, Hoodie, Cap, Jogger or Polo" },
              { step: "2", title: "Enter Quantity", desc: "Discount applies automatically" },
              { step: "3", title: "Upload Designs", desc: "Upload your logo or artwork" },
              { step: "4", title: "We Deliver", desc: "We confirm, produce & deliver" },
            ].map((x) => (
              <div key={x.step} className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">{x.step}</div>
                <h3 className="font-semibold text-base mt-2">{x.title}</h3>
                <p className="text-gray-600 text-xs mt-1">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discount tiers */}
      <section className="bg-white py-10 px-6 border-y">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Bulk Discounts</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { qty: "30-49", discount: "5% OFF" },
              { qty: "50-99", discount: "10% OFF" },
              { qty: "100-299", discount: "20% OFF" },
              { qty: "300-499", discount: "30% OFF" },
              { qty: "500+", discount: "40% OFF" },
            ].map((tier, i) => (
              <div key={i} className="border rounded-2xl p-4 text-center hover:border-black transition">
                <h3 className="text-xl font-extrabold">{tier.discount}</h3>
                <p className="text-xs text-gray-600 mt-1">{tier.qty} pcs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="bulk-form" className="py-10 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="bg-white border rounded-3xl shadow-sm p-5 md:p-8">
            <h2 className="text-2xl font-bold">Place Bulk Order</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the details below to get started.</p>

            {/* Step indicator */}
            <div className="mt-5 flex items-center gap-1">
              {stepItems.map((s, i) => (
                <React.Fragment key={s.num}>
                  <button
                    onClick={() => setStep(s.num)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      step === s.num ? "bg-black text-white" : step > s.num ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                      {step > s.num ? "✓" : s.num}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < stepItems.length - 1 && <div className="h-px flex-1 bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>

            <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
              {/* STEP 1 - Contact */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-900">Contact Information</h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Full Name *</label>
                      <input
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Phone Number *</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10 digit number"
                        inputMode="numeric"
                        maxLength={10}
                        className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Email *</label>
                      <input
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        type="email" placeholder="you@email.com"
                        className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Company / College (optional)</label>
                      <input
                        value={company} onChange={(e) => setCompany(e.target.value)}
                        placeholder="Organization name"
                        className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!step1Valid}
                    onClick={() => setStep(2)}
                    className="mt-2 h-11 w-full rounded-xl bg-black text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    Next: Product Details
                  </button>
                  {!step1Valid && (
                    <p className="text-xs text-gray-500 text-center">Fill name, 10-digit phone, and email to continue.</p>
                  )}
                </div>
              )}

              {/* STEP 2 - Product */}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-gray-900">Product & Quantity</h3>

                  {/* Product selection */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Select Product *</label>
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p.id} type="button"
                          onClick={() => setProduct(p.id)}
                          className={`rounded-xl border p-3 text-center transition text-sm ${
                            product === p.id ? "border-black bg-black text-white" : "hover:border-gray-400"
                          }`}
                        >
                          <div className="text-xl">{p.icon}</div>
                          <div className="mt-1 text-xs font-semibold">{p.label}</div>
                          <div className="text-[10px] opacity-70">Rs {p.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Total Quantity *</label>
                      <input
                        value={quantity || ""} onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                        type="number" min="1" placeholder="e.g. 50"
                        className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      {discount > 0 && (
                        <p className="mt-1 text-xs text-green-700 font-semibold">
                          {Math.round(discount * 100)}% bulk discount applied!
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Fabric Type</label>
                      <select
                        value={clothOption} onChange={(e) => setClothOption(e.target.value)}
                        className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {CLOTH_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Size breakdown */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">
                      Size Breakdown (optional)
                      {totalSizeQty > 0 && <span className="ml-2 text-gray-500">Total: {totalSizeQty}</span>}
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SIZES.map((sz) => (
                        <div key={sz} className="flex items-center gap-1 rounded-lg border px-2 py-1.5">
                          <span className="text-xs font-semibold w-7">{sz}</span>
                          <input
                            type="number" min="0"
                            value={sizeBreakdown[sz] || ""}
                            onChange={(e) => updateSizeQty(sz, e.target.value)}
                            className="w-14 border rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                    {totalSizeQty > 0 && totalSizeQty !== quantity && quantity > 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        Size total ({totalSizeQty}) does not match quantity ({quantity}). We will confirm with you.
                      </p>
                    )}
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">
                      Preferred Colors (optional)
                      {selectedColors.length > 0 && <span className="ml-2 text-gray-500">{selectedColors.length} selected</span>}
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c.name} type="button"
                          onClick={() => toggleColor(c.name)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            selectedColors.includes(c.name) ? "border-black bg-black text-white" : "hover:border-gray-400"
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-gray-300"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Print placement */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Print Placement</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PLACEMENTS.map((p) => (
                        <button
                          key={p.id} type="button"
                          onClick={() => setPrintPlacement(p.id)}
                          className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                            printPlacement === p.id ? "border-black bg-black text-white" : "hover:border-gray-400"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="h-11 flex-1 rounded-xl border text-sm font-bold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button type="button" disabled={!step2Valid} onClick={() => setStep(3)}
                      className="h-11 flex-1 rounded-xl bg-black text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500"
                    >
                      Next: Upload Design
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 - Design Upload & Submit */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-base font-bold text-gray-900">Upload Design & Submit</h3>

                  {/* Upload */}
                  <div>
                    <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-black transition cursor-pointer bg-gray-50">
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="designUpload" />
                      <label htmlFor="designUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm font-semibold text-gray-700">Click to upload your design</p>
                        <p className="text-xs text-gray-500 mt-1">PNG / JPG / SVG — up to 8 files</p>
                      </label>
                    </div>

                    {images.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-800">Uploaded ({images.length}/8)</p>
                          <button type="button" onClick={() => setImages([])} className="text-xs font-semibold text-red-600 hover:underline">
                            Remove all
                          </button>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {images.map((file, index) => (
                            <div key={index} className="relative group">
                              <img src={URL.createObjectURL(file)} alt="design" className="h-20 w-full object-cover rounded-xl border bg-white" />
                              <button type="button" onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-black/70 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery date */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Expected Delivery Date (optional)</label>
                    <input
                      type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Special Instructions (optional)</label>
                    <textarea
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="E.g. 30 pcs Black (M/L), 20 pcs White (S/M), front logo + back name, need by March 25..."
                      className="mt-1 w-full border p-3 rounded-xl h-28 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {submitMsg && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitMsg}</div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)}
                      className="h-11 flex-1 rounded-xl border text-sm font-bold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button type="button" disabled={!canSubmit || submitting} onClick={onSubmitBulk}
                      className="h-12 flex-[2] rounded-xl bg-black text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500"
                    >
                      {submitting ? "Submitting..." : "Submit Bulk Order Request"}
                    </button>
                  </div>

                  {!canSubmit && (
                    <p className="text-xs text-gray-500 text-center">
                      Need: name, phone, email, product, quantity, and at least 1 design image.
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Sidebar - Order Summary */}
          <aside className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white border rounded-3xl shadow-sm p-5">
              <h3 className="text-base font-bold">Order Summary</h3>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product</span>
                  <span className="font-semibold">{product ? PRODUCTS.find((p) => p.id === product)?.label : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fabric</span>
                  <span className="font-semibold">{CLOTH_OPTIONS.find((c) => c.id === clothOption)?.label || "Standard"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold">{quantity || "-"}</span>
                </div>
                {selectedColors.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Colors</span>
                    <span className="font-semibold text-right text-xs max-w-[160px]">{selectedColors.join(", ")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Print</span>
                  <span className="font-semibold">{PLACEMENTS.find((p) => p.id === printPlacement)?.label || "Front"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Designs</span>
                  <span className="font-semibold">{images.length}</span>
                </div>
                {deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery by</span>
                    <span className="font-semibold">{new Date(deliveryDate).toLocaleDateString("en-IN")}</span>
                  </div>
                )}

                <div className="h-px bg-gray-200 my-1" />

                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price / pc</span>
                  <span className="font-semibold">{product ? `Rs ${basePrice}` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className={`font-semibold ${discount > 0 ? "text-green-700" : ""}`}>
                    {canCalculate ? `${Math.round(discount * 100)}%` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final / pc</span>
                  <span className="font-semibold">{canCalculate ? `Rs ${unitPrice}` : "-"}</span>
                </div>

                <div className="h-px bg-gray-200 my-1" />

                <div className="flex justify-between">
                  <span className="font-bold">Estimated Total</span>
                  <span className="text-xl font-extrabold">{canCalculate ? `Rs ${totalPrice.toLocaleString("en-IN")}` : "-"}</span>
                </div>

                {quantity >= 500 && (
                  <div className="text-xs bg-green-50 border border-green-200 rounded-xl p-2.5 text-green-800">
                    500+ quantity — best rate! Submit request and our team will give you the final price.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-3xl shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900">Need Help?</p>
              <p className="mt-1 text-xs text-gray-600">
                Call or WhatsApp us for any questions about bulk orders, pricing, or delivery.
              </p>
              <a href="tel:+919999999999" className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-semibold hover:bg-gray-50">
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
