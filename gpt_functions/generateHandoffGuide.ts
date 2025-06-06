// /gpt_functions/generateHandoffGuide.ts
// Generates a personalized manufacturing handoff guide using GPT

// You should have a callOpenAI utility or similar in your codebase. Adjust the import as needed.
import { callOpenAI } from "./callOpenAI";

export async function generateHandoffGuide({
  process,
  material,
  quantity,
  userIntent,
  risks,
  partName,
}: {
  process: string;
  material: string;
  quantity: number;
  userIntent: string;
  risks?: string[];
  partName: string;
}): Promise<string> {
  const prompt = `
You are an expert manufacturing mentor. Write a handoff guide for manufacturing the part "${partName}" using:
- Process: ${process}
- Material: ${material}
- Quantity: ${quantity}
- User Intent: ${userIntent}

Address:
1. First steps (preparation, tooling, vendor)
2. Key considerations during production
3. Common mistakes to avoid
4. Post-production tips (finishing, QA, packaging)
${risks?.length ? `5. DFM Risks to watch for:\n${risks.join('\n')}` : ''}

Tone: Clear, mentor-like, actionable.
`;
  const response = await callOpenAI(prompt);
  return response;
}
