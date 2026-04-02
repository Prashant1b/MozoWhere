import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartApi } from "../api/cart.api";
import { ordersApi } from "../api/orders.api";
import { paymentApi } from "../api/payment.api";
import { deliveryApi } from "../api/delivery.api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [subtotal, setSubtotal] = useState(Number(location.state?.subtotal || 0));
  const [payable, setPayable] = useState(Number(location.state?.payable || location.state?.subtotal || 0));
  const [couponCode] = useState(String(location.state?.couponCode || ""));

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [paymentMode, setPaymentMode] = useState("cod"); // cod | upi | card | netbanking
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(0);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    addressLine: "",
    city: "",
    state: "",
  });

  const canSubmit = useMemo(() => {
    const phoneOk = /^\d{10}$/.test(String(address.phone || "").trim());
    const pinOk = /^\d{6}$/.test(String(address.pincode || "").trim());
    return (
      address.name.trim() &&
      phoneOk &&
      pinOk &&
      address.addressLine.trim() &&
      address.city.trim() &&
      address.state.trim()
    );
  }, [address]);

  const setField = (k, v) => setAddress((prev) => ({ ...prev, [k]: v }));

  // Check delivery charge when pincode is 6 digits
  useEffect(() => {
    const pin = String(address.pincode || "").trim();
    if (!/^\d{6}$/.test(pin)) {
      setDeliveryInfo(null);
      setShippingCharge(0);
      return;
    }
    let cancelled = false;
    (async () => {
      setDeliveryLoading(true);
      try {
        const res = await deliveryApi.check(pin);
        if (cancelled) return;
        const data = res.data;
        setDeliveryInfo(data);
        if (!data.available) {
          setShippingCharge(0);
        } else if (data.freeAbove > 0 && payable >= data.freeAbove) {
          setShippingCharge(0);
        } else {
          setShippingCharge(data.charge || 0);
        }
        // Auto-fill city and state if available
        if (data.city && !address.city) setField("city", data.city);
        if (data.state && !address.state) setField("state", data.state);
      } catch {
        if (!cancelled) {
          setDeliveryInfo(null);
          setShippingCharge(0);
        }
      } finally {
        if (!cancelled) setDeliveryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [address.pincode, payable]);

  const finalPayable = payable + shippingCharge;

  useEffect(() => {
    if (subtotal > 0 || payable > 0) return;
    (async () => {
      try {
        const res = await cartApi.getMyCart();
        const total = Number(res.data?.cart?.totalAmount || 0);
        setSubtotal(total);
        setPayable(total);
      } catch {}
    })();
  }, [subtotal, payable]);

  const goToOrders = async () => {
    try { await cartApi.clear(); } catch {}
    nav("/profile");
  };

  const payWithRazorpay = async (order) => {
    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Razorpay SDK failed to load");

    const create = await paymentApi.createRazorpayOrder(order._id);
    const data = create.data || {};

    const methodMap = {
      upi: { upi: true, card: false, netbanking: false, wallet: false, emi: false, paylater: false },
      card: { upi: false, card: true, netbanking: false, wallet: false, emi: false, paylater: false },
      netbanking: { upi: false, card: false, netbanking: true, wallet: false, emi: false, paylater: false },
    };

    await new Promise((resolve, reject) => {
      const rz = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Mozowhere",
        description: `Order ${order._id}`,
        order_id: data.razorpayOrderId,
        method: methodMap[paymentMode] || undefined,
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        notes: {
          shipping_address: `${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`,
        },
        handler: async function (response) {
          try {
            await paymentApi.verifyRazorpayPayment({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve(true);
          } catch (e) {
            reject(new Error(e?.response?.data?.message || "Payment verify failed"));
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
        theme: { color: "#111827" },
      });
      rz.open();
    });
  };

  const onPlaceOrder = async () => {
    const phone = String(address.phone || "").trim();
    const pin = String(address.pincode || "").trim();
    if (!/^\d{10}$/.test(phone)) return setMsg("Please enter valid 10-digit mobile number");
    if (!/^\d{6}$/.test(pin)) return setMsg("Please enter valid 6-digit pincode");
    if (!canSubmit) return setMsg("Please fill complete address");
    setMsg("");
    setBusy(true);
    try {
      const created = await ordersApi.createFromCart(
        address,
        paymentMode === "cod" ? "cod" : "online",
        couponCode || undefined
      );
      const order = created.data?.order;
      if (!order?._id) throw new Error("Order creation failed");

      if (paymentMode === "cod") {
        setMsg("Order placed successfully with Cash on Delivery");
        await goToOrders();
        return;
      }

      await payWithRazorpay(order);
      setMsg("Payment successful. Order confirmed.");
      await goToOrders();
    } catch (e) {
      setMsg(e?.response?.data?.message || e?.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="h-11 rounded-xl border border-gray-200 px-3" placeholder="Full name" value={address.name} onChange={(e) => setField("name", e.target.value)} />
            <input
              className="h-11 rounded-xl border border-gray-200 px-3"
              placeholder="Phone (10 digits)"
              value={address.phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            <input
              className="h-11 rounded-xl border border-gray-200 px-3"
              placeholder="Pincode (6 digits)"
              value={address.pincode}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <input className="h-11 rounded-xl border border-gray-200 px-3" placeholder="City" value={address.city} onChange={(e) => setField("city", e.target.value)} />
            <input className="h-11 rounded-xl border border-gray-200 px-3 sm:col-span-2" placeholder="Address line" value={address.addressLine} onChange={(e) => setField("addressLine", e.target.value)} />
            <input className="h-11 rounded-xl border border-gray-200 px-3 sm:col-span-2" placeholder="State" value={address.state} onChange={(e) => setField("state", e.target.value)} />
          </div>

          <h2 className="mt-6 text-lg font-bold text-gray-900">Payment Method</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { id: "cod", label: "Cash on Delivery" },
              { id: "upi", label: "UPI (Razorpay)" },
              { id: "card", label: "Card (Razorpay)" },
              { id: "netbanking", label: "NetBanking (Razorpay)" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMode(m.id)}
                className={`h-11 rounded-xl border px-3 text-sm font-semibold ${
                  paymentMode === m.id ? "border-black bg-black text-white" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {msg ? <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">{msg}</div> : null}
        </section>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal}</span></div>
            {couponCode && payable < subtotal && (
              <div className="flex justify-between text-emerald-700"><span>Discount</span><span>- Rs {subtotal - payable}</span></div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>
                {deliveryLoading ? (
                  <span className="text-slate-400">Checking...</span>
                ) : shippingCharge > 0 ? (
                  `Rs ${shippingCharge}`
                ) : deliveryInfo?.available ? (
                  <span className="text-emerald-600 font-semibold">FREE</span>
                ) : address.pincode.length === 6 ? (
                  <span className="text-slate-400">N/A</span>
                ) : (
                  <span className="text-slate-400">Enter pincode</span>
                )}
              </span>
            </div>
            {deliveryInfo && !deliveryInfo.available && address.pincode.length === 6 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">
                Delivery not configured for this pincode. No delivery charge will be applied.
              </div>
            )}
            {deliveryInfo?.available && deliveryInfo.freeAbove > 0 && shippingCharge > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700">
                Free delivery on orders above Rs {deliveryInfo.freeAbove}
              </div>
            )}
            {deliveryInfo?.available && deliveryInfo.freeAbove > 0 && shippingCharge === 0 && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-700">
                You got free delivery!
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>Rs {finalPayable}</span></div>
          </div>
          <button
            onClick={onPlaceOrder}
            disabled={!canSubmit || busy}
            className="mt-5 h-11 w-full rounded-xl bg-black text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "PROCESSING..." : "Place Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
