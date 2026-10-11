
import extractStudentProfile from "./services/profileService.js";

const studentMessage = `
I am a third-year Computer Engineering student.
I know HTML, CSS, JavaScript, and basic React.
I want to get a frontend internship.
I am confused about whether to learn Node.js or Java next.
`;

try {
  const profile = await extractStudentProfile(studentMessage);

  console.log("\nExtracted Student Profile:\n");
  console.log(JSON.stringify(profile, null, 2));
} catch (error) {
  console.error("\nProfile extraction failed:", error.message);
  process.exitCode = 1;
}