const DeliveryCharge = require("../models/DeliveryChargeModel");

// Admin: list all delivery charges
const listDeliveryCharges = async (req, res) => {
  try {
    const charges = await DeliveryCharge.find().sort({ pincode: 1 }).lean();
    return res.json({ charges });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: create or update delivery charge for a pincode
const upsertDeliveryCharge = async (req, res) => {
  try {
    const { pincode, city, state, charge, freeAbove } = req.body;

    if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ message: "Valid 6-digit pincode is required" });
    }
    if (charge == null || Number(charge) < 0) {
      return res.status(400).json({ message: "Delivery charge must be >= 0" });
    }

    const doc = await DeliveryCharge.findOneAndUpdate(
      { pincode: String(pincode).trim() },
      {
        pincode: String(pincode).trim(),
        city: String(city || "").trim(),
        state: String(state || "").trim(),
        charge: Number(charge),
        freeAbove: Number(freeAbove || 0),
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({ message: "Delivery charge saved", deliveryCharge: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate pincode" });
    }
    return res.status(500).json({ message: err.message });
  }
};

// Admin: delete delivery charge
const deleteDeliveryCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DeliveryCharge.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Delivery charge deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: bulk import delivery charges
const bulkImportDeliveryCharges = async (req, res) => {
  try {
    const { charges } = req.body;
    if (!Array.isArray(charges) || charges.length === 0) {
      return res.status(400).json({ message: "Provide an array of charges" });
    }

    const ops = charges
      .filter((c) => c.pincode && /^\d{6}$/.test(String(c.pincode).trim()))
      .map((c) => ({
        updateOne: {
          filter: { pincode: String(c.pincode).trim() },
          update: {
            $set: {
              pincode: String(c.pincode).trim(),
              city: String(c.city || "").trim(),
              state: String(c.state || "").trim(),
              charge: Number(c.charge || 0),
              freeAbove: Number(c.freeAbove || 0),
              isActive: true,
            },
          },
          upsert: true,
        },
      }));

    if (!ops.length) {
      return res.status(400).json({ message: "No valid entries found" });
    }

    const result = await DeliveryCharge.bulkWrite(ops);
    return res.json({
      message: `Imported ${result.upsertedCount + result.modifiedCount} entries`,
      result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Public: check delivery charge for a pincode
const checkDeliveryCharge = async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ message: "Valid 6-digit pincode required" });
    }

    const doc = await DeliveryCharge.findOne({
      pincode: String(pincode).trim(),
      isActive: true,
    }).lean();

    if (!doc) {
      return res.json({
        available: false,
        message: "Delivery not available for this pincode",
        charge: 0,
        freeAbove: 0,
      });
    }

    return res.json({
      available: true,
      pincode: doc.pincode,
      city: doc.city,
      state: doc.state,
      charge: doc.charge,
      freeAbove: doc.freeAbove,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listDeliveryCharges,
  upsertDeliveryCharge,
  deleteDeliveryCharge,
  bulkImportDeliveryCharges,
  checkDeliveryCharge,
};
