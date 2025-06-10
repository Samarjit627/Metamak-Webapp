// functions/vendorFinder.ts
import { callOpenAI } from "./gptWrapper";

export async function findVendors({
  process,
  material,
  quantity,
  location,
  complexity,
}: {
  process: string;
  material: string;
  quantity: number;
  location?: string;
  complexity?: "low" | "medium" | "high";
}): Promise<string> {
  const prompt = `
You are a vendor sourcing assistant for manufacturing.

Find potential vendor profiles based on:

- Process: ${process}
- Material: ${material}
- Quantity: ${quantity}
- Preferred Location: ${location || "Any"}
- Part Complexity: ${complexity || "medium"}

Recommend:
1. Types of suppliers to look for (SMEs, foundries, job shops)
2. Example cities/regions in India or globally
3. What RFQ details are critical to include
4. Whether offline scouting or platforms (like IndiaMART, Zetwerk, Alibaba) would help

Be concise and practical.
`;
  const response = await callOpenAI(prompt);
  return response;
}
