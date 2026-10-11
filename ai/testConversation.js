
import processStudentMessage from "./services/studentIntakeService.js";

console.log("Starting PATHFINDER conversation test...");

const firstMessage = `
I am a third-year Computer Engineering student.
I know HTML, CSS, JavaScript, and React.
I have built two frontend projects.
I want a frontend internship within two months.
I am confused about whether to learn Node.js or Java next.
`;

const answersByField = {
  availableStudyHoursPerWeek:
    "I can dedicate about 10 hours per week.",
  availableHoursPerDay:
    "I can study about 2 hours per day.",
  studyAvailability:
    "I can study about 2 hours per day.",
  dailyLearningHours:
    "I can study about 2 hours per day.",
  internshipRequirements:
    "I have not reviewed enough internship postings to know yet.",
  internshipFocus:
    "I prefer frontend internships using React, but I am open to full-stack roles.",
  priorNodeJavaExperience:
    "I know JavaScript and React, but I have not built projects with Node.js or Java.",
  companyTechStacks:
    "I have not checked the technology requirements of specific companies yet.",
  targetCompanyBackendTechnology:
    "I have not checked which backend technologies my target companies use."
};

try {
  console.log("\nProcessing the first student message...");

  const firstResult = await processStudentMessage(firstMessage);

  console.log("\n--- FIRST PROFILE ---\n");
  console.log(JSON.stringify(firstResult.profile, null, 2));

  console.log("\n--- QUESTIONS ASKED ---\n");
  console.log(JSON.stringify(firstResult.followUpQuestions, null, 2));

  if (firstResult.followUpQuestions.length === 0) {
    console.log("No follow-up question was required.");
  } else {
    const questionToAnswer = firstResult.followUpQuestions[0];

    const studentAnswer =
      answersByField[questionToAnswer.field] ??
      "I have not checked that information yet.";

    console.log("\n--- QUESTION BEING ANSWERED ---\n");
    console.log(questionToAnswer.question);

    console.log("\n--- STUDENT'S ANSWER ---\n");
    console.log(studentAnswer);

    const secondResult = await processStudentMessage(
      studentAnswer,
      firstResult.profile,
      questionToAnswer
    );

    console.log("\n--- UPDATED PROFILE ---\n");
    console.log(JSON.stringify(secondResult.profile, null, 2));

    console.log("\n--- SAVED CONTEXT ANSWERS ---\n");
    console.log(
      JSON.stringify(secondResult.profile.contextAnswers, null, 2)
    );

    console.log("\n--- NEXT QUESTIONS ---\n");
    console.log(
      JSON.stringify(secondResult.followUpQuestions, null, 2)
    );

    const skillsPreserved = firstResult.profile.skills.every(
      (skill) => secondResult.profile.skills.includes(skill)
    );

    const optionsPreserved = firstResult.profile.options.every(
      (option) => secondResult.profile.options.includes(option)
    );

    const answerRecorded = Array.isArray(
      secondResult.profile.contextAnswers
    ) && secondResult.profile.contextAnswers.some(
      (item) =>
        item.field === questionToAnswer.field &&
        item.value === studentAnswer
    );

    console.log("\n--- CHECKS ---\n");
    console.log("Previous skills preserved:", skillsPreserved);
    console.log("Previous options preserved:", optionsPreserved);
    console.log("Previous answer recorded:", answerRecorded);
  }
} catch (error) {
  console.error("\nConversation test failed:", error.message);
  process.exitCode = 1;
}