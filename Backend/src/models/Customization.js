import mongoose from "mongoose";

const placementSchema = new mongoose.Schema(
  {
     x: Number, 
     y: Number, 
     scale: Number, 
     rotation: Number
     },
  { _id: false }
);

const areaDesignSchema = new mongoose.Schema(
  {
    areaKey: { type: String, required: true }, // "front", "back"
    designImage: { type: String },             // uploaded image url
    text: { type: String, default: "" },
    textColor: { type: String, default: "#000000" },
    placement: { type: placementSchema, default: () => ({ x: 0, y: 0, scale: 1, rotation: 0 }) },
  },
  { _id: false }
);

const customizationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "CustomizableItem", required: true },

    size: { type: String },  // optional (accessories me null)
    color: { type: String, required: true },

    designs: { type: [areaDesignSchema], default: [] }, // front/back/sleeve...

    previewImages: { type: Map, of: String, default: {} }, // {front:"url", back:"url"}
    computedPrice: { type: Number, required: true },

    status: { type: String, enum: ["draft", "ready"], default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.model("Customization", customizationSchema);