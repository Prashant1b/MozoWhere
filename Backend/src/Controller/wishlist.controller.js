const Wishlist = require("../models/WishlistModel");

const getWishlist = async (req, res) => {
  const userId = req.user._id;
  const wl = await Wishlist.findOne({ user: userId }).populate("products");
  return res.json({ wishlist: wl || { user: userId, products: [] } });
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });

    let wl = await Wishlist.findOne({ user: userId });
    if (!wl) wl = await Wishlist.create({ user: userId, products: [] });

    const exists = wl.products.some((p) => p.toString() === productId);
    wl.products = exists ? wl.products.filter((p) => p.toString() !== productId) : [...wl.products, productId];

    await wl.save();
    return res.json({ wishlist: wl });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getWishlist, toggleWishlist };