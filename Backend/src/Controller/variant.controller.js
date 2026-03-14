const ProductVariant = require("../models/ProductVariant");
const Product = require("../models/ProductModel");

const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color, sku, price, stock, image, isActive } = req.body;

    if (!size?.trim() || !color?.trim()) {
      return res.status(400).json({ message: "Size and color are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const exists = await ProductVariant.findOne({
      product: productId,
      size: size.trim(),
      color: color.trim(),
    });
    if (exists) return res.status(409).json({ message: "Variant already exists for this size/color" });

    const variant = await ProductVariant.create({
      product: productId,
      size: size.trim(),
      color: color.trim(),
      sku: sku?.trim(),
      price: price != null ? Number(price) : undefined,
      stock: stock != null ? Number(stock) : 0,
      image,
      isActive: isActive ?? true,
    });

    res.status(201).json({ variant });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const listVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await ProductVariant.find({ product: productId }).sort({ createdAt: -1 });
    res.json({ variants });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, color, sku, price, stock, image, isActive } = req.body;

    const variant = await ProductVariant.findById(id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // ✅ prevent duplicate size+color for same product (recommended)
    const nextSize = size?.trim() ? size.trim() : variant.size;
    const nextColor = color?.trim() ? color.trim() : variant.color;

    const duplicate = await ProductVariant.findOne({
      _id: { $ne: id },
      product: variant.product,
      size: nextSize,
      color: nextColor,
    });

    if (duplicate) {
      return res.status(409).json({ message: "Another variant already exists with same size/color" });
    }

    if (size?.trim()) variant.size = size.trim();
    if (color?.trim()) variant.color = color.trim();
    if (sku != null) variant.sku = sku?.trim();
    if (price != null) variant.price = Number(price);
    if (stock != null) variant.stock = Number(stock);
    if (image != null) variant.image = image;
    if (isActive != null) variant.isActive = Boolean(isActive);

    await variant.save();
    res.json({ variant });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductVariant.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Variant not found" });
    res.json({ message: "Variant deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const listAllVariants = async (req, res) => {
  try {
    const { q, productId, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (productId) filter.product = productId;
    if (isActive != null) filter.isActive = isActive === "true";

    if (q?.trim()) {
      const s = q.trim();
      filter.$or = [
        { sku: { $regex: s, $options: "i" } },
        { size: { $regex: s, $options: "i" } },
        { color: { $regex: s, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [variants, total] = await Promise.all([
      ProductVariant.find(filter)
        .populate("product", "title name category price images") // adjust fields based on Product schema
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ProductVariant.countDocuments(filter),
    ]);

    res.json({
      variants,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const toggleVariantActive = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariant.findById(id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    variant.isActive = !variant.isActive;
    await variant.save();
    res.json({ variant });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports = {
  createVariant,
  listVariantsByProduct,
  updateVariant,
  deleteVariant,
  listAllVariants,
  toggleVariantActive,
};