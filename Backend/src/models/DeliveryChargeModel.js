const mongoose = require("mongoose");

const deliveryChargeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{6}$/,
    },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    charge: {
      type: Number,
      required: true,
      min: 0,
    },
    freeAbove: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryChargeSchema.index({ pincode: 1 });

module.exports = mongoose.model("DeliveryCharge", deliveryChargeSchema);
