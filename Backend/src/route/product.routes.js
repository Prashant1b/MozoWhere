const express =require("express");
const adminmiddleware=require("../middleware/adminmiddleware");
const {
  createProduct,
  listProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductDetail
} =require("../Controller/product.controller");

const router = express.Router();

router.get("/", listProducts);
router.get("/id/:id", getProductById);
router.get("/:slug/detail", getProductDetail);
router.get("/:slug", getProductBySlug);
router.post("/", adminmiddleware, createProduct);
router.put("/:id", adminmiddleware, updateProduct);
router.delete("/:id", adminmiddleware, deleteProduct);

module.exports= router;