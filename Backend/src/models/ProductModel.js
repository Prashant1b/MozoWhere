const mongoose=require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
     gender:{
      type:String,
      required:true,
      enum:["Male","Female","All"]
     },
    sizeRequired: { type: Boolean, default: true },
    images: [{ type: String }],
    tags: [{ type: String }],

    basePrice: { type: Number, required: true },      
    discountPrice: { type: Number },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, gender: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

const Product= mongoose.model("Product", productSchema);
module.exports=Product;
