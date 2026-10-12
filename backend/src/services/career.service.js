const { randomUUID } = require("crypto");
const pool = require("../config/db");

function normalizeList(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
}

function hasItem(list, target) {
    return list.some((item) => item.toLowerCase() === target.toLowerCase());
}

function compareCareerOptions(input) {
    const studentSkills = normalizeList(input.skills);
    const interests = normalizeList(input.interests);
    const constraints = normalizeList(input.constraints);

    const options = input.options.map((option) => {
        const requiredSkills = normalizeList(option.requiredSkills);
        const matchingSkills = requiredSkills.filter((s) => hasItem(studentSkills, s));
        const missingSkills = requiredSkills.filter((s) => !hasItem(studentSkills, s));

        const skillMatchPercentage = requiredSkills.length
            ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
            : null;

        const matchingInterests = normalizeList(option.relevantInterests).filter(
            (i) => hasItem(interests, i)
        );

        return {
            name: option.name.trim(),
            requiredSkills,
            matchingSkills,
            missingSkills,
            skillMatchPercentage,
            matchingInterests,
            constraintsToConsider: constraints,
            note: "This comparison uses the skills and interests you reported. It is not a verified aptitude or job-market assessment.",
        };
    });

    return {
        studentProfile: { skills: studentSkills, interests, constraints },
        options,
        disclaimer:
            "Skill match is a simple comparison, not a probability of career success or a job-placement prediction.",
    };
}

async function createComparison(input) {
    const comparison = compareCareerOptions(input);
    const id = randomUUID();

    await pool.query(
        `INSERT INTO career_comparisons (id, profile_id, options_json, comparison_json)
         VALUES ($1, $2, $3, $4)`,
        [
            id,
            input.profileId || null,
            JSON.stringify(input.options),
            JSON.stringify(comparison),
        ]
    );

    return { id, ...comparison };
}

async function getComparison(id) {
    const { rows } = await pool.query(
        `SELECT id, profile_id, options_json, comparison_json, created_at
         FROM career_comparisons
         WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
}

module.exports = { createComparison, getComparison };