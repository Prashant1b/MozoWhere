const mongoose = require("mongoose");

const printAreaSchema = new mongoose.Schema(
  {
    side: { type: String, enum: ["front", "back", "left", "right"], required: true },
    x: Number, y: Number, w: Number, h: Number, // design area coords (relative)
    maxUploadMB: { type: Number, default: 10 },
  },
  { _id: false }
);

const customizeTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },

    type: { type: String, enum: ["tshirt", "hoodie", "cap", "mug", "pen", "accessory"], required: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    basePrice: { type: Number, required: true },

    colors: [{ type: String }], // ["White","Black","Lavender"]
    sizes: [{ type: String }],  // ["XS","S","M","L","XL","2XL","3XL"]

    fabrics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fabric" }], // ✅ fabric choices

    mockups: {
      front: String,
      back: String,
      left: String,
      right: String,
    },

    printAreas: { type: [printAreaSchema], default: [] },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const customize = mongoose.model("CustomizeTemplate", customizeTemplateSchema);
module.exports=customize;