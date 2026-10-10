const pool = require("../config/db");
const { createComparison, getComparison } = require("../services/career.service");

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function compareCareers(req, res, next) {
    try {
        const { profileId, skills, interests, constraints, options } = req.body;

        if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Provide between 2 and 5 career options.",
            });
        }

        for (const option of options) {
            if (
                !option ||
                typeof option.name !== "string" ||
                !option.name.trim() ||
                !Array.isArray(option.requiredSkills) ||
                !Array.isArray(option.relevantInterests)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each option needs a name, requiredSkills array, and relevantInterests array.",
                });
            }
        }

        if (
            (skills !== undefined && !Array.isArray(skills)) ||
            (interests !== undefined && !Array.isArray(interests)) ||
            (constraints !== undefined && !Array.isArray(constraints))
        ) {
            return res.status(400).json({
                success: false,
                message: "Skills, interests and constraints must be arrays.",
            });
        }

        if (profileId !== undefined && profileId !== null) {
            if (typeof profileId !== "string" || !UUID_REGEX.test(profileId)) {
                return res.status(400).json({
                    success: false,
                    message: "profileId must be a valid UUID.",
                });
            }

            const { rows } = await pool.query(
                "SELECT id FROM student_profiles WHERE id = $1",
                [profileId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found.",
                });
            }
        }

        const result = await createComparison({
            profileId: profileId || null,
            skills: skills || [],
            interests: interests || [],
            constraints: constraints || [],
            options,
        });

        return res.status(201).json({
            success: true,
            message: "Career comparison created.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function readComparison(req, res, next) {
    try {
        if (!UUID_REGEX.test(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comparison ID.",
            });
        }

        const result = await getComparison(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Career comparison not found.",
            });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

module.exports = { compareCareers, readComparison };