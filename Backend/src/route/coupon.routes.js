const express = require("express");
const adminmiddleware = require("../middleware/adminmiddleware");
const usermiddleware = require("../middleware/usermiddleware");
const {
  applyCoupon,
  listCoupons,
  createCoupon,
  deleteCoupon,
  listActiveOffers,
} = require("../Controller/coupon.controller");

const router = express.Router();
router.get("/", adminmiddleware, listCoupons);
router.get("/offers", listActiveOffers);
router.post("/", adminmiddleware, createCoupon);
router.delete("/:id", adminmiddleware, deleteCoupon);
router.post("/apply", usermiddleware, applyCoupon);

module.exports = router;
