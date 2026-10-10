const { randomUUID } = require("crypto");
const pool = require("../config/db");
const { generateReply } = require("../services/chat.service");

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_MESSAGE_LENGTH = 2000;
const HISTORY_LIMIT = 10;

async function sendMessage(req, res, next) {
    try {
        const { message, sessionId, profileId } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message must be a non-empty string.",
            });
        }

        if (message.trim().length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.`,
            });
        }

        const cleanMessage = message.trim();
        let currentSessionId = sessionId || null;
        let isNewSession = false;
        let sessionProfileId = null;
        let history = [];

        if (currentSessionId) {
            if (typeof currentSessionId !== "string" || !UUID_REGEX.test(currentSessionId)) {
                return res.status(400).json({
                    success: false,
                    message: "sessionId must be a valid UUID.",
                });
            }

            const { rows } = await pool.query(
                "SELECT id, profile_id FROM chat_sessions WHERE id = $1",
                [currentSessionId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Chat session not found.",
                });
            }

            sessionProfileId = rows[0].profile_id;

            const result = await pool.query(
                `SELECT sender, message FROM (
                    SELECT id, sender, message
                    FROM chat_messages
                    WHERE session_id = $1
                    ORDER BY id DESC
                    LIMIT $2
                 ) recent
                 ORDER BY id ASC`,
                [currentSessionId, HISTORY_LIMIT]
            );
            history = result.rows;
        } else {
            isNewSession = true;
            currentSessionId = randomUUID();

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

                sessionProfileId = profileId;
            }
        }

        let profile = null;
        if (sessionProfileId) {
            const { rows } = await pool.query(
                "SELECT education, skills, interests FROM student_profiles WHERE id = $1",
                [sessionProfileId]
            );
            profile = rows[0] || null;
        }

        const assistantMessage = await generateReply({
            history,
            message: cleanMessage,
            profile,
        });

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            if (isNewSession) {
                await client.query(
                    "INSERT INTO chat_sessions (id, profile_id) VALUES ($1, $2)",
                    [currentSessionId, sessionProfileId]
                );
            }

            await client.query(
                "INSERT INTO chat_messages (session_id, sender, message) VALUES ($1, 'student', $2)",
                [currentSessionId, cleanMessage]
            );
            await client.query(
                "INSERT INTO chat_messages (session_id, sender, message) VALUES ($1, 'assistant', $2)",
                [currentSessionId, assistantMessage]
            );

            await client.query("COMMIT");
        } catch (dbError) {
            await client.query("ROLLBACK");
            throw dbError;
        } finally {
            client.release();
        }

        return res.status(200).json({
            success: true,
            data: {
                sessionId: currentSessionId,
                userMessage: cleanMessage,
                assistantMessage,
                aiConnected: true,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function getHistory(req, res, next) {
    try {
        const { sessionId } = req.params;

        if (!UUID_REGEX.test(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session ID.",
            });
        }

        const session = await pool.query(
            "SELECT id, profile_id, created_at FROM chat_sessions WHERE id = $1",
            [sessionId]
        );

        if (session.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Chat session not found.",
            });
        }

        const { rows } = await pool.query(
            `SELECT sender, message, created_at
             FROM chat_messages
             WHERE session_id = $1
             ORDER BY id ASC`,
            [sessionId]
        );

        return res.status(200).json({
            success: true,
            data: {
                sessionId,
                createdAt: session.rows[0].created_at,
                messages: rows,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { sendMessage, getHistory };