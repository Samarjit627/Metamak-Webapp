// gpt_functions/suggestMaterialForIntent.ts
import { materialLibrary } from "../data/materialLibrary";
// For Node.js/SSR: use require. For React, use fetch to your backend API route.
const { Configuration, OpenAIApi } = require("openai");

// This function uses OpenAI to suggest a material based on user intent
export async function suggestMaterialForIntent({
  designIntent,
  process = "Injection Molding",
  quantity = 1000,
  performanceNeeds = "",
  budgetPriority = "medium"
}: {
  designIntent: string;
  process?: string;
  quantity?: number;
  performanceNeeds?: string;
  budgetPriority?: string;
}): Promise<string> {
  // Compose a prompt for GPT
  const prompt = `You are a manufacturing and materials expert. Based on the following design intent, process, quantity, and priorities, suggest the most suitable material from this list: ${materialLibrary.map(m => m.name).join(", ")}.\n\nDesign Intent: ${designIntent}\nProcess: ${process}\nQuantity: ${quantity}\nPerformance Needs: ${performanceNeeds}\nBudget Priority: ${budgetPriority}\n\nReply with the best material, a short rationale, and alternatives if relevant.`;

  // Use OpenAI API (assumes API key set in env)
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  return completion.data.choices[0].message?.content || "No suggestion available.";
}
