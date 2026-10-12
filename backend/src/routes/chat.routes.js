const express = require("express");
const router = express.Router();

const { sendMessage, getHistory } = require("../controllers/chat.controller");
const { validateBody } = require("../middleware/validate.middleware");

router.post("/", validateBody(["message"]), sendMessage);
router.get("/:sessionId", getHistory);

module.exports = router;