const express = require("express");
const router = express.Router();

const { compareCareers, readComparison } = require("../controllers/career.controller");
const { validateBody } = require("../middleware/validate.middleware");

router.post("/compare", validateBody(["options"]), compareCareers);
router.get("/compare/:id", readComparison);

module.exports = router;