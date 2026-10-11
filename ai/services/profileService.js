
import callLLM from "./llmService.js";
import buildProfilePrompt from "../prompts/profilePrompt.js";

const keepExistingValue = (newValue, oldValue) => {
  if (
    newValue === null ||
    newValue === undefined ||
    (typeof newValue === "string" && !newValue.trim())
  ) {
    return oldValue ?? null;
  }

  return newValue;
};

const hasMeaningfulValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(hasMeaningfulValue);
  }

  if (typeof value === "object") {
    return Object.values(value).some(hasMeaningfulValue);
  }

  return false;
};

const mergeLists = (oldList, newList) => {
  const existing = Array.isArray(oldList) ? oldList : [];
  const incoming = Array.isArray(newList) ? newList : [];
  const result = new Map();

  for (const item of [...existing, ...incoming]) {
    // Ignore empty objects such as {}.
    if (!hasMeaningfulValue(item)) {
      continue;
    }

    const key =
      typeof item === "string"
        ? item.trim().toLowerCase()
        : JSON.stringify(item);

    if (!result.has(key)) {
      result.set(key, item);
    }
  }

  return [...result.values()];
};

const mergeContextAnswers = (oldAnswers, newAnswers) => {
  const answers = [
    ...(Array.isArray(oldAnswers) ? oldAnswers : []),
    ...(Array.isArray(newAnswers) ? newAnswers : []),
  ];

  const result = new Map();

  for (const answer of answers) {
    if (
      answer &&
      typeof answer.field === "string" &&
      typeof answer.value === "string"
    ) {
      // Keep only the latest answer for each field.
      result.set(answer.field, {
        field: answer.field,
        value: answer.value,
      });
    }
  }

  return [...result.values()];
};

const normalizeHours = (newValue, oldValue) => {
  if (
    typeof newValue === "number" &&
    Number.isFinite(newValue) &&
    newValue >= 0
  ) {
    return newValue;
  }

  if (typeof newValue === "string") {
    const match = newValue.match(
      /(?:^|\D)(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)(?:\s|$)/i
    );

    if (match) {
      return Number(match[1]);
    }
  }

  return oldValue ?? null;
};

const mergeProfile = (current = {}, extracted = {}) => {
  const oldEducation = current.education ?? {};
  const newEducation = extracted.education ?? {};

  const oldConstraints = current.constraints ?? {};
  const newConstraints = extracted.constraints ?? {};

  return {
    education: {
      degree: keepExistingValue(
        newEducation.degree,
        oldEducation.degree
      ),
      branch: keepExistingValue(
        newEducation.branch,
        oldEducation.branch
      ),
      year: keepExistingValue(
        newEducation.year,
        oldEducation.year
      ),
      institution: keepExistingValue(
        newEducation.institution,
        oldEducation.institution
      ),
    },

    skills: mergeLists(current.skills, extracted.skills),

    // Preserve the number of projects without inventing project details.
    projectCount: keepExistingValue(
      extracted.projectCount,
      current.projectCount
    ),

    projects: mergeLists(current.projects, extracted.projects),

    experience: mergeLists(
      current.experience,
      extracted.experience
    ),

    careerGoal: keepExistingValue(
      extracted.careerGoal,
      current.careerGoal
    ),

    dilemma: keepExistingValue(
      extracted.dilemma,
      current.dilemma
    ),

    options: mergeLists(current.options, extracted.options),

    constraints: {
      availableHoursPerDay: normalizeHours(
        newConstraints.availableHoursPerDay,
        oldConstraints.availableHoursPerDay
      ),

      budget: keepExistingValue(
        newConstraints.budget,
        oldConstraints.budget
      ),

      locationPreference: keepExistingValue(
        newConstraints.locationPreference,
        oldConstraints.locationPreference
      ),
    },

    contextAnswers: mergeContextAnswers(
      current.contextAnswers,
      extracted.contextAnswers
    ),

    missingInformation: Array.isArray(extracted.missingInformation)
      ? extracted.missingInformation
      : current.missingInformation ?? [],
  };
};

const extractStudentProfile = async (
  studentMessage,
  currentProfile = {},
  previousQuestion = null
) => {
  if (
    typeof studentMessage !== "string" ||
    !studentMessage.trim()
  ) {
    throw new Error("Please provide a student's message.");
  }

  const prompt = buildProfilePrompt(
    studentMessage,
    currentProfile,
    previousQuestion
  );

  const response = await callLLM(prompt);

  const cleanedResponse = response
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  let extractedProfile;

  try {
    extractedProfile = JSON.parse(cleanedResponse);
  } catch {
    throw new Error(
      "The AI response was not valid profile JSON."
    );
  }

  if (
    !extractedProfile ||
    typeof extractedProfile !== "object" ||
    extractedProfile === null ||
    !extractedProfile.education ||
    !Array.isArray(extractedProfile.skills) ||
    !Array.isArray(extractedProfile.missingInformation)
  ) {
    throw new Error("The AI returned an invalid profile structure.");
  }

  const updatedProfile = mergeProfile(
    currentProfile,
    extractedProfile
  );

  // Save the student's answer to the exact question that was asked.
  // This does not depend on the AI returning contextAnswers correctly.
  if (
    previousQuestion &&
    typeof previousQuestion.field === "string"
  ) {
    updatedProfile.contextAnswers = mergeContextAnswers(
      updatedProfile.contextAnswers,
      [
        {
          field: previousQuestion.field,
          value: studentMessage.trim(),
        },
      ]
    );
  }

  return updatedProfile;
};

export default extractStudentProfile;