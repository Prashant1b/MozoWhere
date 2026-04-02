const mongoose = require("mongoose");
const Cart = require("../models/CartModel");
const Order = require("../models/OrderModel");
const ProductVariant = require("../models/ProductVariant");
const CustomDesign = require("../models/CustomDesignModel");
const Coupon = require("../models/CouponModel");
const User = require("../models/user");
const DeliveryCharge = require("../models/DeliveryChargeModel");

const createOrderFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const normalizedPaymentMethod = paymentMethod === "cod" ? "cod" : "online";

    // Check if COD is blocked for this user
    if (normalizedPaymentMethod === "cod") {
      const currentUser = await User.findById(userId).select("codBlocked").lean();
      if (currentUser?.codBlocked) {
        return res.status(403).json({ message: "Cash on Delivery is not available for your account. Please use online payment." });
      }
    }

    const phone = String(shippingAddress?.phone || "").trim();
    const pincode = String(shippingAddress?.pincode || "").trim();
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Valid 10-digit mobile number is required" });
    }
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Valid 6-digit pincode is required" });
    }

    session.startTransaction();

    const cart = await Cart.findOne({ user: userId }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cart is empty" });
    }

    const productItems = cart.items.filter((it) => it.type !== "custom");
    const customItems = cart.items.filter((it) => it.type === "custom");

    const variantIds = productItems.map((it) => it.variant).filter(Boolean);
    const customDesignIds = customItems.map((it) => it.customDesign).filter(Boolean);

    const [variants, customDesigns] = await Promise.all([
      ProductVariant.find({ _id: { $in: variantIds } }).populate("product").session(session),
      CustomDesign.find({ _id: { $in: customDesignIds }, user: userId }).populate("template").populate("selected.fabric").session(session),
    ]);
    const vmap = new Map(variants.map((v) => [v._id.toString(), v]));
    const dmap = new Map(customDesigns.map((d) => [d._id.toString(), d]));

    const orderItems = [];
    let subtotalAmount = 0;

    for (const item of cart.items) {
      const qty = Math.max(1, Number(item.quantity) || 1);

      if (item.type === "custom") {
        const design = dmap.get(String(item.customDesign));
        if (!design) {
          await session.abortTransaction();
          return res.status(400).json({ message: "Some custom design is not available" });
        }

        const firstDesignImage =
          (Array.isArray(design.layers)
            ? design.layers.find((l) => l?.kind === "image" && l?.imageUrl)?.imageUrl
            : "") || "";

        const previewSnapshot = {
          front: design.preview?.front || design.template?.mockups?.front || "",
          back: design.preview?.back || design.template?.mockups?.back || "",
          left: design.preview?.left || design.template?.mockups?.left || "",
          right: design.preview?.right || design.template?.mockups?.right || "",
        };

        const unitPrice = Number(item.priceAtAdd || design.priceSnapshot?.total || design.template?.basePrice || 0);
        const lineTotal = unitPrice * qty;
        subtotalAmount += lineTotal;

        orderItems.push({
          type: "custom",
          customDesignId: design._id,
          title: design.template?.title || "Customized Product",
          image:
            previewSnapshot.front ||
            previewSnapshot.back ||
            firstDesignImage ||
            "",
          size: design.selected?.size || "",
          color: design.selected?.color || "",
          fabric: design.selected?.fabric?.name || "",
          customSnapshot: {
            selected: {
              color: design.selected?.color || "",
              size: design.selected?.size || "",
              fabric: design.selected?.fabric?.name || "",
            },
            layers: design.layers || [],
            preview: previewSnapshot,
          },
          unitPrice,
          quantity: qty,
          lineTotal,
        });
        continue;
      }

      const v = vmap.get(String(item.variant));
      if (!v || !v.isActive) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Some item is no longer available" });
      }

      if (v.stock < qty) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Not enough stock for ${v.sku || v._id}` });
      }

      const unitPrice = Number(item.priceAtAdd);
      const lineTotal = unitPrice * qty;
      subtotalAmount += lineTotal;

      orderItems.push({
        type: "product",
        variantId: v._id,
        productId: v.product._id,
        title: v.product.title,
        image: v.image || (v.product.images && v.product.images[0]) || "",
        size: v.size,
        color: v.color,
        unitPrice,
        quantity: qty,
        lineTotal,
      });
    }

    if (productItems.length) {
      const stockOps = productItems.map((item) => ({
        updateOne: {
          filter: { _id: item.variant, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      }));
      const bulkResult = await ProductVariant.bulkWrite(stockOps, { session });
      if (bulkResult.modifiedCount !== productItems.length) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Stock update failed (try again)" });
      }
    }

    if (customDesignIds.length) {
      await CustomDesign.updateMany(
        { _id: { $in: customDesignIds }, user: userId },
        { $set: { status: "ordered" } },
        { session }
      );
    }

    let appliedCouponCode = "";
    let discountAmount = 0;
    if (couponCode && String(couponCode).trim()) {
      const normalizedCode = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true }).session(session);
      if (!coupon) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Invalid coupon" });
      }
      if (coupon.expiryDate < new Date()) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Coupon expired" });
      }
      if (subtotalAmount < Number(coupon.minCartAmount || 0)) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Minimum cart amount: ${coupon.minCartAmount}` });
      }

      const idx = (coupon.usageByUser || []).findIndex((u) => String(u?.user) === String(userId));
      const usedCount = idx >= 0 ? Number(coupon.usageByUser[idx]?.count || 0) : 0;
      const userLimit = coupon.perUserLimit == null ? 1 : Math.max(0, Number(coupon.perUserLimit || 0));
      if (userLimit > 0 && usedCount >= userLimit) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Coupon usage limit reached for this user" });
      }

      if (coupon.discountType === "flat") {
        discountAmount = Number(coupon.value || 0);
      } else {
        discountAmount = Math.round((subtotalAmount * Number(coupon.value || 0)) / 100);
        if (coupon.maxDiscount != null) {
          discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount || 0));
        }
      }
      discountAmount = Math.max(0, Math.min(discountAmount, subtotalAmount));
      appliedCouponCode = coupon.code;

      if (idx >= 0) {
        coupon.usageByUser[idx].count = usedCount + 1;
        coupon.usageByUser[idx].lastUsedAt = new Date();
      } else {
        coupon.usageByUser.push({ user: userId, count: 1, lastUsedAt: new Date() });
      }
      await coupon.save({ session });
    }

    // Calculate shipping charge based on pincode
    let shippingCharge = 0;
    const deliveryDoc = await DeliveryCharge.findOne({
      pincode: pincode,
      isActive: true,
    }).session(session);

    if (deliveryDoc) {
      const afterDiscount = Math.max(0, subtotalAmount - discountAmount);
      if (deliveryDoc.freeAbove > 0 && afterDiscount >= deliveryDoc.freeAbove) {
        shippingCharge = 0;
      } else {
        shippingCharge = deliveryDoc.charge;
      }
    }

    const totalAmount = Math.max(0, subtotalAmount - discountAmount + shippingCharge);

    const order = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          subtotalAmount,
          discountAmount,
          couponCode: appliedCouponCode,
          shippingCharge,
          totalAmount,
          shippingAddress: shippingAddress || {},
          orderStatus: normalizedPaymentMethod === "cod" ? "confirmed" : "pending",
          paymentStatus: "pending",
          paymentMethod: normalizedPaymentMethod,
        },
      ],
      { session }
    );

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    return res.status(201).json({ order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-items.customSnapshot.layers -items.customSnapshot.preview")
        .lean(),
      Order.countDocuments({ user: userId }),
    ]);
    return res.json({ orders, total, page, limit });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (["cancelled", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Order cannot be cancelled (status: ${order.orderStatus})` });
    }

    order.orderStatus = "cancelled";
    await order.save();

    const stockRestoreOps = order.items
      .filter((item) => item.type !== "custom" && item.variantId)
      .map((item) => ({
        updateOne: {
          filter: { _id: item.variantId },
          update: { $inc: { stock: item.quantity } },
        },
      }));
    if (stockRestoreOps.length) {
      await ProductVariant.bulkWrite(stockRestoreOps);
    }

    return res.json({ message: "Order cancelled and stock restored", order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId }).select("orderStatus paymentStatus createdAt updatedAt").lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json({ tracking: order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const confirmCodOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be confirmed" });
    }

    order.paymentStatus = "pending";
    order.paymentMethod = "cod";
    order.orderStatus = "confirmed";
    await order.save();

    return res.json({ order, message: "COD order confirmed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrderFromCart, getMyOrders, getOrderById, cancelMyOrder, trackOrder, confirmCodOrder };
