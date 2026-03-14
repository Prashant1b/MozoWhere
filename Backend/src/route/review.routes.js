const express = require("express");
const usermiddleware = require("../middleware/usermiddleware");
const { addOrUpdateReview, listProductReviews } = require("../Controller/review.controller");

const router = express.Router();
router.get("/product/:productId", listProductReviews);
router.post("/", usermiddleware, addOrUpdateReview);

module.exports = router;