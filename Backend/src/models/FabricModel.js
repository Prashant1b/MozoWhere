const mongoose = require("mongoose");

const fabricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, 
    slug: { type: String, required: true, unique: true, lowercase: true },
    extraPrice: { type: Number, default: 0 }, 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Fabric = mongoose.model("Fabric", fabricSchema);
module.exports=Fabric;