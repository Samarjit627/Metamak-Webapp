// ReflectionAgent.ts
import { PartMemory } from "./models/memory.model";
import { callOpenAI } from "./functions/gptWrapper";

export async function ReflectionAgent(memory: PartMemory): Promise<string[]> {
  const prompt = `
You're a reflection engine for an AI co-pilot.

Here is the part memory including agent suggestions and user choices:

DFM Fixes Suggested:
${(memory.agentLogs?.FixAgent?.suggestions || []).join("\n")}

Fixes Accepted by User:
${(memory.agentLogs?.FixAgent?.accepted || []).join("\n")}

Fixes Rejected or Ignored:
${(memory.agentLogs?.FixAgent?.rejected || []).join("\n")}

Reflect:
1. What did the user value most (e.g., fix type, tone, geometry)?
2. What should AI avoid repeating?
3. How should the AI adapt its next version suggestions?

Respond clearly and with reasoning.
`;

  const result = await callOpenAI(prompt);
  return [result];
}
