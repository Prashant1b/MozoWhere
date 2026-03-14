const express = require("express");
const usermiddleware = require("../middleware/usermiddleware");
const { getWishlist, toggleWishlist } = require("../Controller/wishlist.controller");

const router = express.Router();
router.get("/", usermiddleware, getWishlist);
router.post("/toggle", usermiddleware, toggleWishlist);

module.exports = router;