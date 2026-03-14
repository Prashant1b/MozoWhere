const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true },
    minCartAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // for percent
    // 1 = one-time per user, >1 = multiple times, 0 = unlimited
    perUserLimit: { type: Number, default: 1, min: 0 },
    usageByUser: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        count: { type: Number, default: 0 },
        lastUsedAt: Date,
      },
    ],
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
