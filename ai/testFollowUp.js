
import generateFollowUpQuestion from "./services/followUpService.js";


const studentMessage = `
I know React and JavaScript, have built two projects,
and want a full-stack internship within the next two months.
Should I learn Node.js or Java next?
`;

const profile = {
  education: {
    degree: "Computer Engineering",
    branch: "Computer Engineering",
    year: "third-year",
    institution: null
  },
  skills: ["HTML", "CSS", "JavaScript", "basic React"],
  projects: [],
  experience: [],
  careerGoal: "frontend internship",
  dilemma: "confused about whether to learn Node.js or Java next",
  options: ["Node.js", "Java"],
  constraints: {
    availableHoursPerDay: null,
    budget: null,
    locationPreference: null
  },
  missingInformation: [
    "institution",
    "desired internship duration",
    "availability"
  ]
};

try {
  const question = await generateFollowUpQuestion(
    studentMessage,
    profile
  );

  console.log("\nPATHFINDER Follow-up Question:\n");
  console.log(question);
} catch (error) {
  console.error("\nFollow-up test failed:", error.message);
  process.exitCode = 1;
}