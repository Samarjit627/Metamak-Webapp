// ToleranceReviewAgent.ts
import { PartMemory } from "./models/memory.model";
import { callOpenAI } from "./functions/gptWrapper";

export async function ToleranceReviewAgent(memory: PartMemory): Promise<string[]> {
  const prompt = `
You are a tolerance review agent. The following dimensions have tight or risky tolerances:
${Object.entries(memory.toleranceInsights || {}).map(([dim, expl]) => `${dim}: ${expl}`).join("\n")}

Suggest practical ways to relax or improve tolerances, or flag where they are justified. Be concise and actionable.
`;
  const result = await callOpenAI(prompt);
  return [result];
}
