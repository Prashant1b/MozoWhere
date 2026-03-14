const mongoose = require("mongoose");

const layerSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["text", "image"], required: true },
    side: { type: String, enum: ["front", "back", "left", "right"], required: true },

    // placement
    x: Number, y: Number, w: Number, h: Number,
    rotate: { type: Number, default: 0 },

    // text
    text: String,
    font: String,
    color: String,
    fontSize: Number,

    // image
    imageUrl: String,
  },
  { _id: false }
);

const customDesignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "CustomizeTemplate", required: true },

    selected: {
      color: { type: String, required: true },
      size: { type: String }, // cap/mug me size optional
      fabric: { type: mongoose.Schema.Types.ObjectId, ref: "Fabric" }, // ✅ selected fabric
    },

    layers: { type: [layerSchema], default: [] },

    // generated previews (optional)
    preview: {
      front: String,
      back: String,
      left: String,
      right: String,
    },

    priceSnapshot: {
      basePrice: Number,
      fabricExtra: Number,
      printExtra: Number,
      total: Number,
    },

    status: { type: String, enum: ["draft", "ready", "ordered"], default: "draft" },
  },
  { timestamps: true }
);

customDesignSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("CustomDesign", customDesignSchema);