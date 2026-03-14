const express = require("express");
const adminmiddleware = require("../middleware/adminmiddleware");
const { createBulkOrder, listBulkOrders, updateBulkOrderStatus } = require("../Controller/bulkOrder.controller");

const router = express.Router();

router.post("/", createBulkOrder);
router.get("/", adminmiddleware, listBulkOrders);
router.patch("/:id/status", adminmiddleware, updateBulkOrderStatus);

module.exports = router;
