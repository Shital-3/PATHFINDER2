
import callLLM from "./services/llmService.js";

try {
  const answer = await callLLM(
    "Reply with exactly: PATHFINDER Gemini connection successful."
  );

  console.log("\nGemini response:\n", answer);
} catch (error) {
  console.error("\nGemini test failed:", error.message);
  process.exitCode = 1;
}