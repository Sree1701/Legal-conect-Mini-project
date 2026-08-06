const express = require("express");
const router = express.Router();
const { getLegalAIResponse } = require("../controllers/aiController");

// POST /api/ai/chat - Ask AI Legal Question
router.post("/chat", getLegalAIResponse);

module.exports = router;
