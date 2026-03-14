const CustomDesign = require("../models/CustomDesignModel");
const CustomizeTemplate = require("../models/CustomizeTemplateModel");
const Fabric = require("../models/FabricModel");

const createDesign = async (req, res) => {
  const userId = req.user._id;
  const { templateId, color, size, fabricId } = req.body;

  const template = await CustomizeTemplate.findById(templateId);
  if (!template) return res.status(404).json({ message: "Template not found" });

  if (!template.colors.includes(color)) return res.status(400).json({ message: "Invalid color" });
  if (template.sizes.length && !template.sizes.includes(size)) return res.status(400).json({ message: "Invalid size" });

  let fabricExtra = 0;
  if (fabricId) {
    const fab = await Fabric.findById(fabricId);
    if (!fab) return res.status(400).json({ message: "Invalid fabric" });
    if (!template.fabrics.map(String).includes(String(fabricId))) return res.status(400).json({ message: "Fabric not allowed" });
    fabricExtra = fab.extraPrice || 0;
  }

  const total = Number(template.basePrice) + Number(fabricExtra);

  const design = await CustomDesign.create({
    user: userId,
    template: template._id,
    selected: { color, size, fabric: fabricId || undefined },
    priceSnapshot: { basePrice: template.basePrice, fabricExtra, printExtra: 0, total },
    status: "draft",
  });

  res.status(201).json({ design });
};

const getMyDesign = async (req, res) => {
  const d = await CustomDesign.findOne({ _id: req.params.id, user: req.user._id })
    .populate("template")
    .populate("selected.fabric");
  if (!d) return res.status(404).json({ message: "Design not found" });
  res.json({ design: d });
};

const updateDesign = async (req, res) => {
  const { layers, selected, preview } = req.body;

  const d = await CustomDesign.findOne({ _id: req.params.id, user: req.user._id });
  if (!d) return res.status(404).json({ message: "Design not found" });
  if (d.status === "ordered") return res.status(400).json({ message: "Design already ordered" });

  if (Array.isArray(layers)) d.layers = layers;
  if (selected) d.selected = { ...d.selected, ...selected };
  if (preview && typeof preview === "object") {
    d.preview = { ...(d.preview || {}), ...preview };
  }

  await d.save();
  res.json({ design: d });
};

const setReady = async (req, res) => {
  const d = await CustomDesign.findOne({ _id: req.params.id, user: req.user._id });
  if (!d) return res.status(404).json({ message: "Design not found" });

  d.status = "ready";
  await d.save();

  res.json({ design: d });
};

// POST /customize/designs/finalize-and-cart
// Single call: create design + save layers/preview + mark ready + add to cart
const finalizeAndAddToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { templateId, color, size, fabricId, layers, preview } = req.body;

    const template = await CustomizeTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: "Template not found" });

    if (!template.colors.includes(color))
      return res.status(400).json({ message: "Invalid color" });
    if (template.sizes.length && !template.sizes.includes(size))
      return res.status(400).json({ message: "Invalid size" });

    let fabricExtra = 0;
    if (fabricId) {
      const fab = await Fabric.findById(fabricId);
      if (!fab) return res.status(400).json({ message: "Invalid fabric" });
      if (!template.fabrics.map(String).includes(String(fabricId)))
        return res.status(400).json({ message: "Fabric not allowed" });
      fabricExtra = fab.extraPrice || 0;
    }

    const total = Number(template.basePrice) + Number(fabricExtra);

    const design = await CustomDesign.create({
      user: userId,
      template: template._id,
      selected: { color, size, fabric: fabricId || undefined },
      priceSnapshot: { basePrice: template.basePrice, fabricExtra, printExtra: 0, total },
      layers: Array.isArray(layers) ? layers : [],
      preview: preview && typeof preview === "object" ? preview : {},
      status: "ready",
    });

    const Cart = require("../models/CartModel");
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });

    cart.items.push({
      type: "custom",
      customDesign: design._id,
      quantity: 1,
      priceAtAdd: total,
    });
    cart.totalAmount = cart.items.reduce((s, it) => s + it.priceAtAdd * it.quantity, 0);
    await cart.save();

    res.status(201).json({ designId: design._id, message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createDesign, getMyDesign, updateDesign, setReady, finalizeAndAddToCart };
