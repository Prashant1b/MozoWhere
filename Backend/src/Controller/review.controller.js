const Review = require("../models/ReviewModel");

const addOrUpdateReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, comment } = req.body;

    if (!productId) return res.status(400).json({ message: "productId required" });

    const r = await Review.findOneAndUpdate(
      { user: userId, product: productId },
      { rating: Number(rating), comment: comment || "" },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ review: r });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Review already exists" });
    return res.status(500).json({ message: err.message });
  }
};

const listProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate("user", "firstname emailid");
    return res.json({ reviews });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { addOrUpdateReview, listProductReviews };