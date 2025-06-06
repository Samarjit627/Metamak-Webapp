// Axis5 Phase 5 Feature: Tolerance Intelligence Engine
// GPT Function: checkToleranceFeasibility
import { callOpenAI } from "./callOpenAI";

export async function checkToleranceFeasibility({
  toleranceValue,
  dimensionType,
  material,
  process,
  surfaceFinish,
}: {
  toleranceValue: string;         // e.g., ±0.02mm
  dimensionType: string;         // e.g., hole diameter, wall thickness
  material: string;              // e.g., Aluminum 6061
  process: string;               // e.g., CNC Machining
  surfaceFinish?: string;        // e.g., Ra 1.6μm
}): Promise<string> {
  const prompt = `
You are a precision manufacturing expert.

Evaluate the following tolerance for feasibility:

- Tolerance: ${toleranceValue}
- Dimension Type: ${dimensionType}
- Material: ${material}
- Manufacturing Process: ${process}
- Surface Finish: ${surfaceFinish || "Not specified"}

Please assess:
1. Is this tolerance realistic and achievable for this material + process?
2. Is it unnecessarily tight or costly?
3. Suggest a more appropriate range if needed.
4. Explain your reasoning clearly and practically.

Tone: Professional, educational, and actionable.
`;
  const response = await callOpenAI(prompt);
  return response;
}
