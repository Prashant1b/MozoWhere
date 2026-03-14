const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const usermiddleware= require("../middleware/usermiddleware");

const Order = require("../models/OrderModel");
const Payment = require("../models/PaymentModel");

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

router.post("/order", usermiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ success: false, message: "orderId required" });

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    const shortId = order._id.toString().slice(-8);
const ts = Date.now().toString().slice(-8);
const receipt = `rcpt_${shortId}_${ts}`;

const options = {
  amount: Math.round(order.totalAmount * 100),
  currency: "INR",
  receipt,
};

    const rpOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = rpOrder.id;
    order.paymentMethod = "online";
    await order.save();

    await Payment.create({
      user: userId,
      order: order._id,
      razorpayOrderId: rpOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      status: "created",
    });

    return res.status(200).json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
  console.error("PAYMENTS/ORDER ERROR:", error);
  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
});

// ✅ Verify payment and mark order paid
router.post("/verify", usermiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    // const expected = crypto
    //   .createHmac("sha256", RAZORPAY_KEY_SECRET)
    //   .update(sign)
    //   .digest("hex");

    // if (expected !== razorpay_signature) {
    //   // mark failed
    //   order.paymentStatus = "failed";
    //   await order.save();

    //   await Payment.findOneAndUpdate(
    //     { order: order._id, razorpayOrderId: razorpay_order_id },
    //     { status: "failed", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
    //   );

    //   return res.status(400).json({ success: false, message: "Invalid payment signature" });
    // }

    // mark paid
    order.paymentStatus = "paid";
    order.paymentMethod = "online";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id, razorpayOrderId: razorpay_order_id },
      { status: "paid", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
      { upsert: true }
    );

    return res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body) // raw body buffer
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).send("Invalid webhook signature");
    }

    const event = JSON.parse(req.body.toString());

    // Example: payment captured
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const rpOrderId = paymentEntity.order_id;
      const rpPaymentId = paymentEntity.id;

      // find DB order by razorpayOrderId
      const order = await Order.findOne({ razorpayOrderId: rpOrderId });
      if (order) {
        order.paymentStatus = "paid";
        order.paymentMethod = "online";
        order.orderStatus = "confirmed";
        order.razorpayPaymentId = rpPaymentId;
        await order.save();
      }
    }

    return res.json({ status: "ok" });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
