const mongoose=require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, trim: true, default: "" },
    isTrending: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ isTrending: 1, sortOrder: 1 });

const Category= mongoose.model("Category", categorySchema);
module.exports=Category;
