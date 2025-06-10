// FixAgent.ts
import { PartMemory } from "./models/memory.model";
import { callOpenAI } from "./functions/gptWrapper";

export async function FixAgent(memory: PartMemory): Promise<string[]> {
  const prompt = `
You're a manufacturing co-pilot. A part has the following DFM risks:
${memory.dfmFindings?.join("\n")}

Suggest fixes for each one in simple, contextual language.
If it's minor and fixable in CAD, say so. Otherwise, suggest workarounds.

Respond like a proactive assistant, not overly formal.
`;

  const result = await callOpenAI(prompt);
  return [result];
}
