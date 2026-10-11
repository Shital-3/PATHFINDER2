
import extractStudentProfile from "./profileService.js";
import generateFollowUpQuestions from "./followUpService.js";

const processStudentMessage = async (
  studentMessage,
  currentProfile = {},
  previousQuestion = null
) => {
  // 1. Extract or update the student's profile.
  const profile = await extractStudentProfile(
    studentMessage,
    currentProfile,
    previousQuestion
  );

  // 2. Preserve context from the previous question, if available.
  const contextualMessage = previousQuestion
    ? `Previous question: ${JSON.stringify(previousQuestion)}
Student's answer: ${studentMessage}`
    : studentMessage;

  // 3. Generate questions based on the student's actual situation.
  const followUpQuestions = await generateFollowUpQuestions(
    contextualMessage,
    profile
  );

  // 4. Return both the profile and the questions.
  return {
    profile,
    followUpQuestions,
  };
};

export default processStudentMessage;