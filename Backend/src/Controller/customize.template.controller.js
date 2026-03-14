const CustomizeTemplate = require("../models/CustomizeTemplateModel");
const slugify = require("../utils/slugify");

const listTemplates = async (req, res) => {
  const { type, q } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;
  if (q) filter.title = { $regex: q, $options: "i" };

  const templates = await CustomizeTemplate.find(filter).populate("fabrics").sort({ createdAt: -1 });
  res.json({ templates });
};

const getTemplateBySlug = async (req, res) => {
  const t = await CustomizeTemplate.findOne({ slug: req.params.slug, isActive: true }).populate("fabrics");
  if (!t) return res.status(404).json({ message: "Template not found" });
  res.json({ template: t });
};

const createTemplate = async (req, res) => {
  const { title, slug, type, basePrice, colors, sizes, fabrics, mockups, printAreas } = req.body;
  const finalSlug = slug ? slugify(slug) : slugify(title);

  const exists = await CustomizeTemplate.findOne({ slug: finalSlug });
  if (exists) return res.status(409).json({ message: "Slug exists" });

  const t = await CustomizeTemplate.create({
    title, slug: finalSlug, type,
    basePrice: Number(basePrice),
    colors: Array.isArray(colors) ? colors : [],
    sizes: Array.isArray(sizes) ? sizes : [],
    fabrics: Array.isArray(fabrics) ? fabrics : [],
    mockups: mockups || {},
    printAreas: Array.isArray(printAreas) ? printAreas : [],
  });

  res.status(201).json({ template: t });
};

const updateTemplate = async (req, res) => {
  const t = await CustomizeTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) return res.status(404).json({ message: "Template not found" });
  res.json({ template: t });
};

const deleteTemplate = async (req, res) => {
  const t = await CustomizeTemplate.findByIdAndDelete(req.params.id);
  if (!t) return res.status(404).json({ message: "Template not found" });
  res.json({ message: "Deleted" });
};

module.exports = { listTemplates, getTemplateBySlug, createTemplate, updateTemplate, deleteTemplate };