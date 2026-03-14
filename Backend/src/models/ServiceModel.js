const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    subtitle: { type: String, default: "" },
    image: { type: String, default: "" },
    path: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Service", serviceSchema);
