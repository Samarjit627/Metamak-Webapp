// IntentMapperAgent.ts
import { PartMemory } from "./models/memory.model";
import { callOpenAI } from "./functions/gptWrapper";

export async function IntentMapperAgent(memory: PartMemory): Promise<string[]> {
  const prompt = `
You are mapping a user's design intent to AI reasoning logic.

Design Intent:
${memory.designIntent}

Based on this, annotate how AI should behave:
- Should it optimize for cost or performance?
- Is DFM strictness high or low?
- What tone should GPT use (mentor, engineer, manager)?

Summarize the guidance.
`;
  const result = await callOpenAI(prompt);
  return [result];
}
