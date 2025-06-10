// gpt_functions/chatMaterialAdvisor.ts
// For Node.js/SSR: use require. For React, use fetch to your backend API route.
const { Configuration, OpenAIApi } = require("openai");

async function callOpenAI(prompt: string): Promise<string> {
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
    max_tokens: 400,
    temperature: 0.7,
  });
  return completion.data.choices[0].message?.content || "No suggestion available.";
}

import { saveMaterialSuggestion } from "../materialMemoryEngine";

export async function chatMaterialAdvisor(message: string, partId: string): Promise<string> {
  const prompt = `
You are an expert manufacturing material advisor.

A user has asked the following question about material selection:

"${message}"

1. Interpret the intent and use case.
2. Recommend 2–3 suitable materials.
3. Explain why each one fits, with trade-offs.
4. Format response clearly and helpfully.

Respond as if you're in a smart copilot chat, not overly formal.
`;
  const response = await callOpenAI(prompt);
  // Store response to memory for this part
  await saveMaterialSuggestion(partId, message, response);
  return response;
}
