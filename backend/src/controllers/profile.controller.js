const { randomUUID } = require("crypto");

// Temporary storage for Phase 3 only.
// Phase 4 will replace this with PostgreSQL.
const profiles = new Map();

function createProfile(req, res) {
    const { fullName, education, cgpa, skills, interests } = req.body;

    if (cgpa !== undefined &&
        (typeof cgpa !== "number" || cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({
            success: false,
            message: "CGPA must be a number between 0 and 10.",
        });
    }

    if (skills !== undefined && !Array.isArray(skills)) {
        return res.status(400).json({
            success: false,
            message: "Skills must be an array.",
        });
    }

    const profile = {
        id: randomUUID(),
        fullName: fullName.trim(),
        education: education.trim(),
        cgpa: cgpa ?? null,
        skills: skills ?? [],
        interests: interests ?? [],
        createdAt: new Date().toISOString(),
    };

    profiles.set(profile.id, profile);

    return res.status(201).json({
        success: true,
        message: "Profile created successfully.",
        data: profile,
    });
}

function getProfile(req, res) {
    const profile = profiles.get(req.params.id);

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "Profile not found.",
        });
    }

    return res.status(200).json({
        success: true,
        data: profile,
    });
}

module.exports = { createProfile, getProfile };
