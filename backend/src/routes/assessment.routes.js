const express = require("express");
const router = express.Router();

const {
    getQuestions,
    submitAssessment,
} = require("../controllers/assessment.controller");

const { validateBody } = require("../middleware/validate.middleware");

router.get("/questions", getQuestions);

router.post(
    "/submit",
    validateBody(["answers"]),
    submitAssessment
);

module.exports = router;
