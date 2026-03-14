const BulkOrder = require("../models/BulkOrderModel");

const createBulkOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      company,
      email,
      notes,
      product,
      clothOption = "standard",
      quantity,
      sizeBreakdown = [],
      colors = [],
      printPlacement = "front",
      deliveryDate,
      pricing = {},
      images = [],
    } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (!phone?.trim() || !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ message: "Valid 10-digit phone number is required" });
    }
    if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
    if (!["tshirt", "hoodie", "cap", "jogger", "polo"].includes(product)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one design image is required" });
    }

    const normalizedImages = images
      .filter((x) => x?.dataUrl)
      .slice(0, 8)
      .map((x) => ({
        name: x.name || "design",
        mimeType: x.mimeType || "",
        size: Number(x.size || 0),
        dataUrl: x.dataUrl,
      }));

    if (!normalizedImages.length) {
      return res.status(400).json({ message: "Valid design images are required" });
    }

    const normalizedSizes = Array.isArray(sizeBreakdown)
      ? sizeBreakdown.filter((s) => s?.size && Number(s?.quantity) > 0)
      : [];

    const normalizedColors = Array.isArray(colors)
      ? colors.filter((c) => typeof c === "string" && c.trim()).map((c) => c.trim())
      : [];

    const bulkOrder = await BulkOrder.create({
      name: name.trim(),
      phone: phone.trim(),
      company: company?.trim() || "",
      email: email.trim().toLowerCase(),
      notes: notes?.trim() || "",
      product,
      clothOption: String(clothOption || "standard"),
      quantity: qty,
      sizeBreakdown: normalizedSizes,
      colors: normalizedColors,
      printPlacement: ["front", "back", "both", "custom"].includes(printPlacement) ? printPlacement : "front",
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      pricing: {
        basePrice: Number(pricing?.basePrice || 0),
        discountPercent: Number(pricing?.discountPercent || 0),
        unitPrice: Number(pricing?.unitPrice || 0),
        totalPrice: Number(pricing?.totalPrice || 0),
      },
      images: normalizedImages,
    });

    return res.status(201).json({ bulkOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listBulkOrders = async (req, res) => {
  try {
    const bulkOrders = await BulkOrder.find().sort({ createdAt: -1 }).lean();
    return res.json({ bulkOrders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateBulkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["new", "contacted", "quoted", "processing", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await BulkOrder.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Bulk order not found" });
    return res.json({ bulkOrder: order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createBulkOrder, listBulkOrders, updateBulkOrderStatus };
