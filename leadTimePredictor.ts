// leadTimePredictor.ts
import { callOpenAI } from "./functions/gptWrapper";

export async function predictLeadTime({
  process,
  quantity,
  material,
  location,
}: {
  process: string;
  quantity: number;
  material: string;
  location?: string;
}) {
  const prompt = `
Estimate lead time for this part:

- Process: ${process}
- Material: ${material}
- Quantity: ${quantity}
- Location: ${location || "India"}

Account for queue time, tooling time (if any), and shipping delay.
Give a best-case and realistic-case estimate.
`;
  const response = await callOpenAI(prompt);
  return response;
}
