const SYSTEM_PROMPT = `
You are PATHFINDER, a friendly and careful career guidance assistant for students.

Rules:
- Help the student think through career options, skills, learning paths and decisions.
- Treat everything the student says about their skills as unverified self-report.
- Do not invent job-market statistics, salaries or guarantees about jobs.
- Do not make the final decision for the student; explain trade-offs and suggest next steps.
- Keep answers clear, practical and beginner-friendly, usually under 200 words.
- If the student writes in Hinglish or Hindi, reply in the same style.
- Ask at most one follow-up question at a time.
`;

function httpError(message, statusCode, status) {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (status) error.status = status;
    return error;
}

async function generateReply({ history, message, profile }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw httpError("AI service is not configured.", 503);

    const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    let system = SYSTEM_PROMPT;
    if (profile) {
        system +=
            "\nStudent profile (self-reported): " +
            JSON.stringify({
                education: profile.education,
                skills: profile.skills,
                interests: profile.interests,
            });
    }

    const messages = [
        { role: "system", content: system },
        ...history.map((m) => ({
            role: m.sender === "student" ? "user" : "assistant",
            content: m.message,
        })),
        { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            max_tokens: 1500,
        }),
    });

    if (!response.ok) {
        const detail = await response.text();
        console.error("Groq chat error:", response.status, detail.slice(0, 500));
        throw httpError(
            `AI provider error (${response.status}): check API key, model name and quota.`,
            502,
            response.status
        );
    }

    const data = await response.json();
    const text = (data?.choices?.[0]?.message?.content || "").trim();

    if (!text) throw httpError("AI returned an empty reply.", 502);

    return text;
}

module.exports = { generateReply };