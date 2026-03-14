const Cart = require("../models/CartModel");
const CustomDesign = require("../models/CustomDesignModel");

const populateCartQuery = (userId) =>
  Cart.findOne({ user: userId })
    .populate({
      path: "items.variant",
      populate: { path: "product" },
    })
    .populate({
      path: "items.customDesign",
      populate: [{ path: "template" }, { path: "selected.fabric" }],
    });

const recalc = async (cart) => {
  cart.totalAmount = cart.items.reduce((s, it) => s + it.priceAtAdd * it.quantity, 0);
  await cart.save();
  return cart;
};

// POST /api/cart/add-custom  body: { designId, quantity }
const addCustomToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { designId, quantity = 1 } = req.body;

    const design = await CustomDesign.findOne({ _id: designId, user: userId }).populate("template");
    if (!design) return res.status(404).json({ message: "Design not found" });
    if (design.status !== "ready") return res.status(400).json({ message: "Design not finalised (ready) yet" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });

    cart.items.push({
      type: "custom",
      customDesign: design._id,
      quantity: Math.max(1, Number(quantity) || 1),
      priceAtAdd: design.priceSnapshot?.total || design.template.basePrice,
    });

    await recalc(cart);
    const freshCart = await populateCartQuery(userId);
    return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { addCustomToCart };
