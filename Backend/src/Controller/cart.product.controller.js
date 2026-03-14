const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");
const ProductVariant = require("../models/ProductVariant");

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

const recalcCart = async (cart) => {
  cart.totalAmount = cart.items.reduce((sum, it) => sum + it.priceAtAdd * it.quantity, 0);
  await cart.save();
  return cart;
};

const sameProductVariant = (item, variantId) =>
  item?.type !== "custom" && item?.variant && item.variant.toString() === String(variantId);

const getOrCreateOneSizeVariant = async (product) => {
  const existing = await ProductVariant.findOne({
    product: product._id,
    isActive: true,
    stock: { $gt: 0 },
  });
  if (existing) return existing;

  const basePrice = Number(product.discountPrice ?? product.basePrice ?? 0);

  // Accessories often don't need size; we normalize into a one-size variant.
  const oneSize = await ProductVariant.findOneAndUpdate(
    {
      product: product._id,
      size: "ONE_SIZE",
      color: "Default",
    },
    {
      $setOnInsert: {
        product: product._id,
        size: "ONE_SIZE",
        color: "Default",
        price: basePrice,
        stock: 9999,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  return oneSize;
};

// POST /cart/add-product
// body: { productId, quantity }
const addProductToCartByProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    const qty = Math.max(1, Number(quantity) || 1);

    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = await getOrCreateOneSizeVariant(product);
    if (!variant || !variant.isActive) return res.status(400).json({ message: "Unable to create product variant" });
    if (Number(variant.stock || 0) < qty) return res.status(400).json({ message: "Not enough stock" });

    const unitPrice =
      typeof variant.price === "number" ? Number(variant.price) : Number(product.discountPrice ?? product.basePrice ?? 0);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });

    const idx = cart.items.findIndex((it) => sameProductVariant(it, variant._id));
    if (idx >= 0) {
      const nextQty = Number(cart.items[idx].quantity || 0) + qty;
      if (Number(variant.stock || 0) < nextQty) return res.status(400).json({ message: "Not enough stock" });
      cart.items[idx].quantity = nextQty;
      cart.items[idx].priceAtAdd = unitPrice;
    } else {
      cart.items.push({
        type: "product",
        variant: variant._id,
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

module.exports = { addProductToCartByProduct };
