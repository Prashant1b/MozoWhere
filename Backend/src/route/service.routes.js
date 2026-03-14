const express = require("express");
const adminmiddleware = require("../middleware/adminmiddleware");
const { listPublic, listAll, create, update, remove } = require("../Controller/service.controller");

const router = express.Router();

router.get("/", listPublic);
router.get("/all", adminmiddleware, listAll);
router.post("/", adminmiddleware, create);
router.put("/:id", adminmiddleware, update);
router.delete("/:id", adminmiddleware, remove);

module.exports = router;
