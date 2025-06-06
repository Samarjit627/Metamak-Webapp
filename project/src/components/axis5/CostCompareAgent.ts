// CostCompareAgent.ts
import { PartMemory } from "./models/memory.model";
import { callOpenAI } from "./functions/gptWrapper";

export async function CostCompareAgent(memory: PartMemory): Promise<string[]> {
  const prompt = `
You are a manufacturing cost advisor. Given the following:
- Material: ${memory.material}
- Process: ${memory.process}
- Quantity: ${memory.quantity}

Compare 2-3 alternative materials or processes for cost, lead time, and suitability. Present as a concise table or bullet points. Be practical and relevant to the user's region if known.
`;
  const result = await callOpenAI(prompt);
  return [result];
}
