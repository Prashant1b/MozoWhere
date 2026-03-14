const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["product", "custom"], default: "product" },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: false },
    productId: { type: mongoose.Schema.Types.ObjectId, required: false },
    customDesignId: { type: mongoose.Schema.Types.ObjectId, required: false },
    title: String,
    image: String,

    size: String,
    color: String,
    fabric: String,

    customSnapshot: {
      selected: {
        color: String,
        size: String,
        fabric: String,
      },
      layers: [
        {
          kind: String,
          side: String,
          x: Number,
          y: Number,
          w: Number,
          h: Number,
          rotate: Number,
          text: String,
          font: String,
          color: String,
          fontSize: Number,
          imageUrl: String,
        },
      ],
      preview: {
        front: String,
        back: String,
        left: String,
        right: String,
      },
    },

    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    items: { type: [orderItemSchema], default: [] },
    subtotalAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    totalAmount: { type: Number, required: true },

    shippingAddress: {
      name: String,
      phone: String,
      pincode: String,
      addressLine: String,
      city: String,
      state: String,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: undefined,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
