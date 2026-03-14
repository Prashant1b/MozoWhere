const express = require("express");
const usermiddleware = require("../middleware/usermiddleware");
const {
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  trackOrder,
  confirmCodOrder,
} = require("../Controller/order.controller");

const router = express.Router();

router.post("/", usermiddleware, createOrderFromCart); 
router.get("/", usermiddleware, getMyOrders);
router.get("/:id", usermiddleware, getOrderById);
router.post("/:id/cancel", usermiddleware, cancelMyOrder);
router.get("/:id/track", usermiddleware, trackOrder);
router.post("/:id/cod", usermiddleware, confirmCodOrder);

module.exports = router;
