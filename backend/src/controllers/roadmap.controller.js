const { randomUUID } = require("crypto");
const pool = require("../config/db");
const { getComparison } = require("../services/career.service");
const { generateRoadmap } = require("../services/roadmap.service");

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createRoadmap(req, res, next) {
    try {
        const { comparisonId } = req.params;

        if (!UUID_REGEX.test(comparisonId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comparison ID.",
            });
        }

        const comparison = await getComparison(comparisonId);

        if (!comparison) {
            return res.status(404).json({
                success: false,
                message: "Career comparison not found.",
            });
        }

        const roadmap = await generateRoadmap(comparison.comparison_json);
        const roadmapId = randomUUID();

        await pool.query(
            `INSERT INTO career_roadmaps (id, comparison_id, roadmap_json)
             VALUES ($1, $2, $3)`,
            [roadmapId, comparisonId, JSON.stringify(roadmap)]
        );

        return res.status(201).json({
            success: true,
            message: "Career roadmap generated successfully.",
            data: { id: roadmapId, comparisonId, roadmap },
        });
    } catch (error) {
        if (error.status === 401 || error.status === 429) {
            error.statusCode = 502;
            error.message = `AI provider error (${error.status}): check API key, billing and quota.`;
        }
        next(error);
    }
}

async function getRoadmap(req, res, next) {
    try {
        if (!UUID_REGEX.test(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid roadmap ID.",
            });
        }

        const { rows } = await pool.query(
            `SELECT id, comparison_id, roadmap_json, created_at
             FROM career_roadmaps
             WHERE id = $1`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Career roadmap not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: rows[0].id,
                comparisonId: rows[0].comparison_id,
                createdAt: rows[0].created_at,
                roadmap: rows[0].roadmap_json,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { createRoadmap, getRoadmap };