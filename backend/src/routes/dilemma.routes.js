const express = require("express");
const router = express.Router();

const {
    createDilemma,
    getDilemma,
} = require("../controllers/dilemma.controller");

const { validateBody } = require("../middleware/validate.middleware");

router.post(
    "/",
    validateBody(["title", "options"]),
    createDilemma
);

router.get("/:id", getDilemma);

module.exports = router;
