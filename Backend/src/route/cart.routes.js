const express = require("express");
const usermiddleware= require("../middleware/usermiddleware");
const {
  getMyCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  removeCustomCartItem,
  clearCart,
} = require("../Controller/cart.controller");
const CustomCustomizer = require("../Controller/cart.custom.controller");
const ProductCartController = require("../Controller/cart.product.controller");

const router = express.Router();

router.get("/", usermiddleware, getMyCart);
router.post("/add", usermiddleware, addToCart);
router.post("/add-product", usermiddleware, ProductCartController.addProductToCartByProduct);
router.put("/item", usermiddleware, updateCartItemQty);
router.delete("/item/:variantId", usermiddleware, removeCartItem);
router.delete("/custom-item/:itemId", usermiddleware, removeCustomCartItem);
router.delete("/clear", usermiddleware, clearCart);
router.post("/add-custom", usermiddleware, CustomCustomizer.addCustomToCart);

module.exports = router;
