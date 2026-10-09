const { randomUUID } = require("crypto");

function sendMessage(req, res) {
    const { message, sessionId = null } = req.body;

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: "Message must be a non-empty string.",
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            sessionId: sessionId || randomUUID(),
            userMessage: message.trim(),
            assistantMessage:
                "Thanks for sharing. AI integration is not connected yet.",
            aiConnected: false,
        },
    });
}

module.exports = { sendMessage };
