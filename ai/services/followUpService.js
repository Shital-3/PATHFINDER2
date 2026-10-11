
import callLLM from "./llmService.js";
import buildFollowUpPrompt from "../prompts/followUpPrompt.js";

const normalizeField = (field) =>
  typeof field === "string"
    ? field.trim().toLowerCase()
    : "";

const generateFollowUpQuestions = async (
  studentMessage,
  profile
) => {
  if (
    typeof studentMessage !== "string" ||
    !studentMessage.trim()
  ) {
    throw new Error("Please provide the student's message.");
  }

  if (!profile || typeof profile !== "object") {
    throw new Error("A valid student profile is required.");
  }

  const prompt = buildFollowUpPrompt(studentMessage, profile);
  const response = await callLLM(prompt);

  const cleanedResponse = response
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  let result;

  try {
    result = JSON.parse(cleanedResponse);
  } catch {
    throw new Error(
      "The AI did not return valid follow-up question JSON."
    );
  }

  if (
    !result ||
    !Array.isArray(result.questions)
  ) {
    throw new Error(
      "The AI response must contain a questions array."
    );
  }

  if (result.questions.length > 4) {
    throw new Error(
      "The AI returned too many questions. Maximum allowed: 4."
    );
  }

  for (const item of result.questions) {
    if (
      !item ||
      typeof item.field !== "string" ||
      typeof item.question !== "string" ||
      typeof item.whyItMatters !== "string" ||
      !item.field.trim() ||
      !item.question.trim()
    ) {
      throw new Error(
        "A follow-up question has an invalid structure."
      );
    }
  }

  // Fields already answered or explicitly acknowledged as unknown.
  const answeredFields = new Set(
    (Array.isArray(profile.contextAnswers)
      ? profile.contextAnswers
      : []
    )
      .map((answer) => normalizeField(answer.field))
      .filter(Boolean)
  );

  // Prevent repeated fields and duplicate questions in the same batch.
  const seenFields = new Set();
  const filteredQuestions = [];

  for (const item of result.questions) {
    const field = normalizeField(item.field);

    if (answeredFields.has(field)) {
      continue;
    }

    if (seenFields.has(field)) {
      continue;
    }

    seenFields.add(field);
    filteredQuestions.push(item);
  }

  return filteredQuestions;
};

export default generateFollowUpQuestions;