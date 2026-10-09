const express = require("express");
const router = express.Router();

const { sendMessage } = require("../controllers/chat.controller");
const { validateBody } = require("../middleware/validate.middleware");

router.post(
    "/",
    validateBody(["message"]),
    sendMessage
);

module.exports = router;
