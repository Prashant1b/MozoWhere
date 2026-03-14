const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    // 🔥 important: identify item type
    type: {
      type: String,
      enum: ["product", "custom"],
      required: true
    },

    // 🛒 Normal product
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant"
    },

    // 🎨 Custom product
    customDesign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomDesign"
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    priceAtAdd: {
      type: Number,
      required: true
    }
  },
  { _id: true } 
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    items: [cartItemSchema],

    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;