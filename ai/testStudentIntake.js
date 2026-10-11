
import processStudentMessage from "./services/studentIntakeService.js";

const studentMessage = `
I am a third-year Computer Engineering student.
I know HTML, CSS, JavaScript, and basic React.
I have built two frontend projects.
I want a frontend internship within the next two months.
I am confused about whether to learn Node.js or Java next.
`;

try {
  const result = await processStudentMessage(studentMessage);

  console.log("\n--- Extracted Student Profile ---\n");
  console.log(JSON.stringify(result.profile, null, 2));

  console.log("\n--- Follow-up Questions ---\n");

  if (result.followUpQuestions.length === 0) {
    console.log(
      "Enough information is available to move toward a recommendation."
    );
  } else {
    result.followUpQuestions.forEach((item, index) => {
      console.log(`${index + 1}. ${item.question}`);
      console.log(`   Information needed: ${item.field}`);
      console.log(`   Why it matters: ${item.whyItMatters}\n`);
    });
  }
} catch (error) {
  console.error("\nStudent intake test failed:", error.message);
  process.exitCode = 1;
}