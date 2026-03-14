const express =require("express");
const adminmiddleware=require("../middleware/adminmiddleware");
const {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} =require("../Controller/category.controller");

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/", adminmiddleware, createCategory);
router.put("/:id", adminmiddleware, updateCategory);
router.delete("/:id", adminmiddleware, deleteCategory);

module.exports= router;