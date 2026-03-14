const express = require("express");
const adminmiddleware = require("../middleware/adminmiddleware");
const {
  updateOrderStatus,
  listAllOrders,
  getOrderDetail,
  listAllUsers,
  updateUserRole,
  deleteUser,
  toggleCodBlock,
} = require("../Controller/admin.controller");

const router = express.Router();

// Orders
router.get("/orders", adminmiddleware, listAllOrders);
router.get("/orders/:id", adminmiddleware, getOrderDetail);
router.put("/orders/:id/status", adminmiddleware, updateOrderStatus);

// User management
router.get("/users", adminmiddleware, listAllUsers);
router.put("/users/:id/role", adminmiddleware, updateUserRole);
router.delete("/users/:id", adminmiddleware, deleteUser);
router.patch("/users/:id/cod-block", adminmiddleware, toggleCodBlock);

module.exports = router;
