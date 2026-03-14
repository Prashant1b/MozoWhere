const express =require("express");
const adminmiddleware=require("../middleware/adminmiddleware");
const {
  createVariant,
  listVariantsByProduct,
  updateVariant,
  deleteVariant,
  listAllVariants,
  toggleVariantActive
} =require("../Controller/variant.controller");

const router = express.Router();

router.get("/product/:productId", listVariantsByProduct);

router.get("/admin/all", adminmiddleware, listAllVariants);               
router.patch("/:id/active", adminmiddleware, toggleVariantActive);

// admin
router.post("/product/:productId", adminmiddleware, createVariant);
router.put("/:id", adminmiddleware, updateVariant);
router.delete("/:id", adminmiddleware, deleteVariant);

module.exports=router;