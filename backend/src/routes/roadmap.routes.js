const express = require("express");
const router = express.Router();

const { createRoadmap, getRoadmap } = require("../controllers/roadmap.controller");

router.post("/from-comparison/:comparisonId", createRoadmap);
router.get("/:id", getRoadmap);

module.exports = router;