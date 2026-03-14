const Order = require("../models/OrderModel");
const User = require("../models/user");

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid orderStatus" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "email emailid fullname name")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "email emailid fullname name")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── User Management ───

const listAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Get order stats for all users in one query
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          delivered: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
          },
          codOrders: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, 1, 0] },
          },
          onlineOrders: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "online"] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[String(s._id)] = {
        totalOrders: s.totalOrders,
        totalSpent: s.totalSpent,
        delivered: s.delivered,
        cancelled: s.cancelled,
        pending: s.pending,
        codOrders: s.codOrders,
        onlineOrders: s.onlineOrders,
      };
    });

    const usersWithStats = users.map((u) => ({
      ...u,
      orderStats: statsMap[String(u._id)] || {
        totalOrders: 0,
        totalSpent: 0,
        delivered: 0,
        cancelled: 0,
        pending: 0,
        codOrders: 0,
        onlineOrders: 0,
      },
    }));

    return res.json({ users: usersWithStats });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'user'" });
    }

    // Prevent admin from demoting themselves
    if (String(req.user._id) === id && role === "user") {
      return res.status(400).json({ message: "You cannot demote yourself" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (String(req.user._id) === id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const toggleCodBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.codBlocked = !user.codBlocked;
    await user.save();

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateOrderStatus,
  listAllOrders,
  getOrderDetail,
  listAllUsers,
  updateUserRole,
  deleteUser,
  toggleCodBlock,
};
