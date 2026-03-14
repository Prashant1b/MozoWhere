const express = require("express");
const usermiddleware = require("../middleware/usermiddleware");
const { getDesignSuggestions } = require("../Controller/ai.suggestion.controller");

const router = express.Router();

router.post("/design-suggestions", usermiddleware, getDesignSuggestions);

module.exports = router;
