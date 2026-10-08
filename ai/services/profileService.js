const profilePrompt = require("../prompts/profilePrompt");
const llmService = require("./llmService");

function generateProfile(studentProfile) {
  const prompt = profilePrompt + `

Student Profile:
${JSON.stringify(studentProfile, null, 2)}
`;

  return llmService.generateResponse(prompt);
}

module.exports = {
  generateProfile
};