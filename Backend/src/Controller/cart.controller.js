const Cart = require("../models/CartModel");
const ProductVariant = require("../models/ProductVariant");

const populateCartQuery = (userId) =>
  Cart.findOne({ user: userId })
    .populate({
      path: "items.variant",
      select: "product size color price stock image isActive",
      populate: { path: "product", select: "title slug images basePrice discountPrice" },
    })
    .populate({
      path: "items.customDesign",
      select: "template selected layers preview priceSnapshot status",
      populate: [
        { path: "template", select: "title slug mockups basePrice printAreas" },
        { path: "selected.fabric", select: "name price" },
      ],
    });

// helper to compute current unit price
const getVariantUnitPrice = async (variantId) => {
  const variant = await ProductVariant.findById(variantId).populate("product", "basePrice");
  if (!variant || !variant.isActive) return null;

  const unitPrice =
    typeof variant.price === "number" ? variant.price : variant.product.basePrice;

  return { variant, unitPrice };
};

const recalcCart = async (cart) => {
  cart.totalAmount = cart.items.reduce((sum, it) => sum + it.priceAtAdd * it.quantity, 0);
  await cart.save();
  return cart;
};

const sameProductVariant = (item, variantId) =>
  item?.type !== "custom" && item?.variant && item.variant.toString() === variantId;

const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await populateCartQuery(userId).lean();

    return res.json({ cart: cart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { variantId, quantity = 1 } = req.body;

    if (!variantId) return res.status(400).json({ message: "variantId is required" });
    const qty = Math.max(1, Number(quantity) || 1);

    const data = await getVariantUnitPrice(variantId);
    if (!data) return res.status(404).json({ message: "Variant not found" });

    const { variant, unitPrice } = data;

    if (variant.stock < qty) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });

    const idx = cart.items.findIndex((it) => sameProductVariant(it, variantId));

    if (idx >= 0) {
      const newQty = cart.items[idx].quantity + qty;
      if (variant.stock < newQty) return res.status(400).json({ message: "Not enough stock" });

      cart.items[idx].quantity = newQty;
      cart.items[idx].priceAtAdd = unitPrice; // refresh snapshot price
    } else {
      cart.items.push({
        type: "product",
        variant: variantId,
        quantity: qty,
        priceAtAdd: unitPrice,
      });
    }

    await recalcCart(cart);
    const freshCart = await populateCartQuery(userId);
    return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const updateCartItemQty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { variantId, quantity } = req.body;

    if (!variantId) return res.status(400).json({ message: "variantId is required" });

    const qty = Number(quantity);
    if (!Number.isFinite(qty)) return res.status(400).json({ message: "quantity invalid" });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.items.findIndex((it) => sameProductVariant(it, variantId));
    if (idx < 0) return res.status(404).json({ message: "Item not found in cart" });

    if (qty <= 0) {
      cart.items.splice(idx, 1);
      await recalcCart(cart);
      const freshCart = await populateCartQuery(userId);
      return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
    }

    const data = await getVariantUnitPrice(variantId);
    if (!data) return res.status(404).json({ message: "Variant not found" });

    const { variant, unitPrice } = data;
    if (variant.stock < qty) return res.status(400).json({ message: "Not enough stock" });

    cart.items[idx].quantity = qty;
    cart.items[idx].priceAtAdd = unitPrice;

    await recalcCart(cart);
    const freshCart = await populateCartQuery(userId);
    return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /cart/item/:variantId
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { variantId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((it) => !sameProductVariant(it, variantId));
    await recalcCart(cart);
    const freshCart = await populateCartQuery(userId);
    return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /cart/custom-item/:itemId
const removeCustomCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (it) => !(it.type === "custom" && it._id.toString() === itemId)
    );

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Custom item not found in cart" });
    }

    await recalcCart(cart);
    const freshCart = await populateCartQuery(userId);
    return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /cart/clear
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ cart: { user: userId, items: [], totalAmount: 0 } });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    const freshCart = await populateCartQuery(userId);
    return res.json({ cart: freshCart || { user: userId, items: [], totalAmount: 0 } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  removeCustomCartItem,
  clearCart,
};
