const { mongoose } = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    size: { type: String, required: true },   
    color: { type: String, required: true },  
    sku: { type: String, unique: true, sparse: true },

    price: { type: Number },   
    stock: { type: Number, default: 0 },

    image: { type: String },   
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

variantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });

const ProductVariant=mongoose.model("ProductVariant", variantSchema);
module.exports=ProductVariant;