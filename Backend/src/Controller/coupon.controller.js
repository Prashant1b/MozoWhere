const Coupon = require("../models/CouponModel");
const Cart = require("../models/CartModel");

const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return res.json({ coupons });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      value,
      minCartAmount = 0,
      maxDiscount,
      perUserLimit = 1,
      expiryDate,
      isActive = true,
    } = req.body;

    if (!code?.trim()) return res.status(400).json({ message: "Coupon code required" });
    if (!["percent", "flat"].includes(discountType)) {
      return res.status(400).json({ message: "discountType must be percent or flat" });
    }

    const numValue = Number(value);
    if (!Number.isFinite(numValue) || numValue <= 0) {
      return res.status(400).json({ message: "value must be a positive number" });
    }
    if (discountType === "percent" && numValue > 100) {
      return res.status(400).json({ message: "percent value cannot be greater than 100" });
    }

    if (!expiryDate) return res.status(400).json({ message: "expiryDate is required" });

    const ex = new Date(expiryDate);
    if (Number.isNaN(ex.getTime())) return res.status(400).json({ message: "Invalid expiryDate" });
    if (ex <= new Date()) return res.status(400).json({ message: "expiryDate must be in the future" });

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      value: numValue,
      minCartAmount: Number(minCartAmount) || 0,
      perUserLimit: Math.max(0, Number(perUserLimit) || 1),
      expiryDate: ex,
      isActive: Boolean(isActive),
    };

    if (discountType === "percent" && maxDiscount != null && maxDiscount !== "") {
      const md = Number(maxDiscount);
      if (!Number.isFinite(md) || md < 0) {
        return res.status(400).json({ message: "maxDiscount must be >= 0" });
      }
      payload.maxDiscount = md;
    }

    const exists = await Coupon.findOne({ code: payload.code });
    if (exists) return res.status(409).json({ message: "Coupon already exists" });

    const coupon = await Coupon.create(payload);
    return res.status(201).json({ coupon });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Coupon not found" });
    return res.json({ message: "Coupon deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code?.trim()) return res.status(400).json({ message: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart empty" });

    if (cart.totalAmount < coupon.minCartAmount) {
      return res.status(400).json({ message: `Minimum cart amount: ${coupon.minCartAmount}` });
    }

    const usedEntry = (coupon.usageByUser || []).find(
      (u) => String(u?.user) === String(userId)
    );
    const usedCount = Number(usedEntry?.count || 0);
    const userLimit =
      coupon.perUserLimit == null ? 1 : Math.max(0, Number(coupon.perUserLimit || 0));
    if (userLimit > 0 && usedCount >= userLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached for this user" });
    }

    let discount = 0;

    if (coupon.discountType === "flat") {
      discount = coupon.value;
    } else {
      discount = Math.round((cart.totalAmount * coupon.value) / 100);
      if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
    }

    discount = Math.max(0, Math.min(discount, cart.totalAmount));
    const payable = cart.totalAmount - discount;

    return res.json({
      coupon: coupon.code,
      discount,
      payable,
      perUserLimit: userLimit,
      usedCount,
      remainingUses: userLimit === 0 ? null : Math.max(0, userLimit - usedCount),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { applyCoupon, listCoupons, createCoupon, deleteCoupon };
