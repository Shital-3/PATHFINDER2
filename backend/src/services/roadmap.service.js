const INSTRUCTIONS = `
You are PATHFINDER, a careful career planning assistant.

Use only the supplied student profile and career comparison.
Do not invent job-market statistics, salaries, or verified skills.
Treat reported skills as unverified self-reports.
Do not guarantee employment or career success.
Do not make the final career decision for the student.
Create a practical beginner-friendly learning roadmap.
Account for stated constraints, such as available preparation time.
If time availability is unknown, state that the timeline is illustrative.
Return only valid JSON with this exact structure:
{
  "summary": "short explanation",
  "options": [
    {
      "career": "option name",
      "advantages": ["..."],
      "tradeoffs": ["..."],
      "skillGaps": ["..."],
      "milestones": [
        { "title": "...", "duration": "...", "tasks": ["..."], "project": "..." }
      ]
    }
  ],
  "nextSteps": ["..."],
  "caveats": ["..."]
}
Include an option for every career in the supplied comparison.
Keep the roadmap realistic and specific.
`;

function httpError(message, statusCode, status) {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (status) error.status = status;
    return error;
}

async function generateRoadmap(comparison) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw httpError("AI service is not configured.", 503);

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: INSTRUCTIONS },
                {
                    role: "user",
                    content:
                        "Student profile and career comparison (JSON):\n" +
                        JSON.stringify(comparison),
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
            max_tokens: 4000,
        }),
    });

    if (!response.ok) {
        const detail = await response.text();
        console.error("Groq error:", response.status, detail.slice(0, 500));
        throw httpError(
            `AI provider error (${response.status}): check API key, model name and quota.`,
            502,
            response.status
        );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";

    let roadmap;
    try {
        roadmap = JSON.parse(text);
    } catch {
        throw httpError("AI returned invalid roadmap JSON.", 502);
    }

    if (
        !roadmap ||
        typeof roadmap.summary !== "string" ||
        !Array.isArray(roadmap.options) ||
        !Array.isArray(roadmap.nextSteps) ||
        !Array.isArray(roadmap.caveats)
    ) {
        throw httpError("AI roadmap response has an unexpected structure.", 502);
    }

    return roadmap;
}

module.exports = { generateRoadmap };