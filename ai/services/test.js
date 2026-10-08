const { generateResponse } = require("./llmService");

async function test() {
  const answer = await generateResponse("Say Hello in one short sentence.");
  console.log(answer);
}

test().catch(console.error);