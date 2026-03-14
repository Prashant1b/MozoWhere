const Product = require("../models/ProductModel")
const Category = require("../models/CategoryModel")
const slugify = require("../utils/slugify");
const mongoose = require('mongoose');
const ProductVariant = require("../models/ProductVariant");

const ALLOWED_GENDERS = ["Male", "Female", "All"];
const parseBool = (v, fallback = undefined) => {
    if (v === undefined || v === null || v === "") return fallback;
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
    return fallback;
};
const resolveCategoryId = async (category) => {
    if (!category) return null;
    if (mongoose.Types.ObjectId.isValid(category)) return category;
    const cat = await Category.findOne({
        $or: [
            { slug: category.toString().trim().toLowerCase() },
            { name: new RegExp(`^${category.toString().trim()}$`, "i") },
        ],
    });

    return cat ? cat._id : null;
};



const createProduct = async (req, res) => {
    const { title, slug, description, category,gender, sizeRequired, images, tags, basePrice, discountPrice, isActive } =
        req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!category) return res.status(400).json({ message: "Category is required" });
    if (!gender || !ALLOWED_GENDERS.includes(gender)) {
      return res.status(400).json({ message: "Gender is required (Male/Female/All)" });
    }
    if (basePrice == null) return res.status(400).json({ message: "Base price is required" });
    const categoryId = await resolveCategoryId(req.body.category);
    if (!categoryId) {
        return res.status(400).json({ message: "Invalid category (send category _id or valid slug/name)" });
    }
    const cat = await Category.findById(categoryId);
    if (!cat) return res.status(400).json({ message: "Invalid category" });

    const finalSlug = slug?.trim() ? slugify(slug) : slugify(title);
    const exists = await Product.findOne({ slug: finalSlug });
    if (exists) return res.status(409).json({ message: "Product slug already exists" });

    const product = await Product.create({
        title: title.trim(),
        slug: finalSlug,
        description: description ?? "",
        category: categoryId,
         gender,
        sizeRequired: parseBool(sizeRequired, true),
        images: Array.isArray(images) ? images : [],
        tags: Array.isArray(tags) ? tags : [],
        basePrice: Number(basePrice),
        discountPrice: discountPrice != null ? Number(discountPrice) : undefined,
        isActive: isActive ?? true,
    });

    res.status(201).json({ product });
};

const getProductBySlug = async (req, res) => {
    const { slug } = req.params;
    const product = await Product.findOne({ slug }).populate("category").lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category").lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
};
const listProducts = async (req, res) => {
    const {
        q,
        categorySlug,
         gender, 
        minPrice,
        maxPrice,
        active,
        page = 1,
        limit = 12,
        sort = "-createdAt",
    } = req.query;

    const filter = {};

    if (active != null) filter.isActive = active === "true";

    if (q?.trim()) {
        filter.$or = [
            { title: { $regex: q.trim(), $options: "i" } },
            { tags: { $in: [new RegExp(q.trim(), "i")] } },
        ];
    }

     if (gender?.trim()) {
      const g = gender.trim();
      if (!ALLOWED_GENDERS.includes(g)) {
        return res.status(400).json({ message: "Invalid gender. Use Male, Female or All" });
      }
      // "All" products should appear in both Male/Female views.
      if (g === "All") {
        filter.gender = "All";
      } else {
        filter.gender = { $in: [g, "All"] };
      }
    }

    if (minPrice != null || maxPrice != null) {
        filter.basePrice = {};
        if (minPrice != null) filter.basePrice.$gte = Number(minPrice);
        if (maxPrice != null) filter.basePrice.$lte = Number(maxPrice);
    }

    if (categorySlug?.trim()) {
        const cat = await Category.findOne({ slug: categorySlug.trim() });
        if (!cat) return res.json({ products: [], total: 0, page: Number(page), limit: Number(limit) });
        filter.category = cat._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
        Product.find(filter).populate("category").sort(sort).skip(skip).limit(Number(limit)).lean(),
        Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        slug,
        description,
        category, 
         gender,
        sizeRequired,
        images,
        tags,
        basePrice,
        discountPrice,
        isActive,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (title?.trim()) product.title = title.trim();

    if (slug?.trim()) product.slug = slugify(slug);
    else if (title?.trim()) product.slug = slugify(title);

    if (description != null) product.description = description;

    if (category) {
        const cat = await Category.findById(category);
        if (!cat) return res.status(400).json({ message: "Invalid category" });
        product.category = category;
    }

     if (gender != null) {
      if (!ALLOWED_GENDERS.includes(gender)) {
        return res.status(400).json({ message: "Invalid gender. Use Male, Female or All" });
      }
      product.gender = gender;
    }
    if (sizeRequired != null) product.sizeRequired = parseBool(sizeRequired, product.sizeRequired);

    if (Array.isArray(images)) product.images = images;
    if (Array.isArray(tags)) product.tags = tags;

    if (basePrice != null) product.basePrice = Number(basePrice);
    if (discountPrice != null) product.discountPrice = Number(discountPrice);
    if (isActive != null) product.isActive = Boolean(isActive);

    const conflict = await Product.findOne({ slug: product.slug, _id: { $ne: id } });
    if (conflict) return res.status(409).json({ message: "Slug already in use" });

    await product.save();
    res.json({ product });
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
};


const getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true }).populate("category").lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await ProductVariant.find({
      product: product._id,
      isActive: true,
    }).sort({ createdAt: -1 }).lean();

    return res.json({ product, variants });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



module.exports = {
    createProduct,
    getProductBySlug,
    getProductById,
    listProducts,
    updateProduct,
    deleteProduct,
    getProductDetail

}
