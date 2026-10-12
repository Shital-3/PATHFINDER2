const express = require("express");
const router = express.Router();

const {
    createProfile,
    getProfile,
} = require("../controllers/profile.controller");

const { validateBody } = require("../middleware/validate.middleware");

router.post(
    "/",
    validateBody(["fullName", "education"]),
    createProfile
);

router.get("/:id", getProfile);

module.exports = router;
