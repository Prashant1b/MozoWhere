const Service = require("../models/ServiceModel");

const slugify = (str) =>
  String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const listPublic = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return res.json({ services });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listAll = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return res.json({ services });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, subtitle, image, path, sortOrder, isActive } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (!path?.trim()) return res.status(400).json({ message: "Path is required" });

    const slug = slugify(name);
    const exists = await Service.findOne({ slug });
    if (exists) return res.status(409).json({ message: "Service with this name already exists" });

    const service = await Service.create({
      name: name.trim(),
      slug,
      subtitle: subtitle?.trim() || "",
      image: image?.trim() || "",
      path: path.trim(),
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== false,
    });
    return res.status(201).json({ service });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subtitle, image, path, sortOrder, isActive } = req.body;

    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (name?.trim()) {
      service.name = name.trim();
      service.slug = slugify(name);
    }
    if (subtitle != null) service.subtitle = String(subtitle).trim();
    if (image != null) service.image = String(image).trim();
    if (path?.trim()) service.path = path.trim();
    if (sortOrder != null) service.sortOrder = Number(sortOrder) || 0;
    if (isActive != null) service.isActive = Boolean(isActive);

    await service.save();
    return res.json({ service });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    return res.json({ message: "Service deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { listPublic, listAll, create, update, remove };
