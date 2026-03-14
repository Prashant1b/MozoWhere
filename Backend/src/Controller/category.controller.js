const Category=require("../models/CategoryModel")
const  slugify  =require( "../utils/slugify");

const parseBool = (v, fallback = undefined) => {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  return fallback;
};

const createCategory = async (req, res) => {
  const { name, slug, image, isTrending, sortOrder } = req.body;

  if (!name?.trim()) return res.status(400).json({ message: "Category name is required" });

  const finalSlug = (slug?.trim() ? slugify(slug) : slugify(name));
  const exists = await Category.findOne({ slug: finalSlug });
  if (exists) return res.status(409).json({ message: "Category already exists" });

  const category = await Category.create({
    name: name.trim(),
    slug: finalSlug,
    image: image?.trim?.() || "",
    isTrending: parseBool(isTrending, true),
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
  });
  res.status(201).json({ category });
};

const getAllCategories = async (req, res) => {
  const { trending, withImage } = req.query;
  const filter = {};
  const onlyTrending = parseBool(trending, undefined);
  const onlyWithImage = parseBool(withImage, undefined);

  if (onlyTrending !== undefined) filter.isTrending = onlyTrending;
  if (onlyWithImage) filter.image = { $nin: ["", null] };

  const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.json({ categories });
};

const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug }).lean();
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ category });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, image, isTrending, sortOrder } = req.body;

  const category = await Category.findById(id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (name?.trim()) category.name = name.trim();
  if (slug?.trim()) category.slug = slugify(slug);
  else if (name?.trim()) category.slug = slugify(name); // keep slug synced if you want
  if (image != null) category.image = String(image || "").trim();
  if (isTrending != null) category.isTrending = parseBool(isTrending, category.isTrending);
  if (sortOrder != null && Number.isFinite(Number(sortOrder))) category.sortOrder = Number(sortOrder);

  const conflict = await Category.findOne({ slug: category.slug, _id: { $ne: id } });
  if (conflict) return res.status(409).json({ message: "Slug already in use" });

  await category.save();
  res.json({ category });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted" });
};

module.exports={createCategory,getAllCategories,getCategoryBySlug,updateCategory,deleteCategory};
