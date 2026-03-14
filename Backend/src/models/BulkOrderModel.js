const mongoose = require("mongoose");

const bulkImageSchema = new mongoose.Schema(
  {
    name: String,
    mimeType: String,
    size: Number,
    dataUrl: String,
  },
  { _id: false }
);

const sizeBreakdownSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const bulkOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    notes: { type: String, trim: true },

    product: { type: String, enum: ["tshirt", "hoodie", "cap", "jogger", "polo"], required: true },
    clothOption: { type: String, default: "standard" },
    quantity: { type: Number, required: true, min: 1 },

    sizeBreakdown: { type: [sizeBreakdownSchema], default: [] },
    colors: { type: [String], default: [] },
    printPlacement: { type: String, enum: ["front", "back", "both", "custom"], default: "front" },
    deliveryDate: { type: Date },

    pricing: {
      basePrice: Number,
      discountPercent: Number,
      unitPrice: Number,
      totalPrice: Number,
    },

    images: { type: [bulkImageSchema], default: [] },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "processing", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BulkOrder", bulkOrderSchema);
