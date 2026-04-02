const express = require("express");
const adminmiddleware = require("../middleware/adminmiddleware");
const usermiddleware = require("../middleware/usermiddleware");
const {
  listDeliveryCharges,
  upsertDeliveryCharge,
  deleteDeliveryCharge,
  bulkImportDeliveryCharges,
  checkDeliveryCharge,
} = require("../Controller/delivery.controller");

const router = express.Router();

// Public: check delivery for a pincode (user must be logged in)
router.get("/check/:pincode", usermiddleware, checkDeliveryCharge);

// Admin routes
router.get("/", adminmiddleware, listDeliveryCharges);
router.post("/", adminmiddleware, upsertDeliveryCharge);
router.post("/bulk", adminmiddleware, bulkImportDeliveryCharges);
router.delete("/:id", adminmiddleware, deleteDeliveryCharge);

module.exports = router;
