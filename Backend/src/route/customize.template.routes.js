const express = require("express");
const adminmiddleware = require("../middleware/adminmiddleware");
const {
  listTemplates,
  getTemplateBySlug,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../Controller/customize.template.controller");

const router = express.Router();

router.get("/", listTemplates);                 
router.get("/:slug", getTemplateBySlug);        

router.post("/", adminmiddleware, createTemplate);
router.put("/:id", adminmiddleware, updateTemplate);
router.delete("/:id", adminmiddleware, deleteTemplate);

module.exports = router;