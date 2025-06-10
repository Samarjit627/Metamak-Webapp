// Axis5 Feature: Assembly Impact Checker GPT Function
import { callOpenAI } from "./callOpenAI";

export async function checkAssemblyImpact({
  changedFeature,
  matingPartInfo,
  fitType,
  originalClearance,
  newGeometryContext,
}: {
  changedFeature: string;          // e.g., "Rib depth increased from 4mm to 6mm"
  matingPartInfo: string;         // e.g., "Fits into motor mount groove, press-fit"
  fitType: string;                // e.g., "press fit", "sliding fit"
  originalClearance: string;      // e.g., "0.1 mm"
  newGeometryContext: string;     // e.g., "Wall offset now 1mm thinner"
}): Promise<string> {
  const prompt = `
You're a mechanical assembly expert.
Evaluate the impact of a design change on part-to-part fit:

- Changed Feature: ${changedFeature}
- Mating Part Info: ${matingPartInfo}
- Fit Type: ${fitType}
- Original Clearance: ${originalClearance}
- New Geometry Context: ${newGeometryContext}

Check if:
1. Assembly will still fit as intended
2. Interference or looseness could occur
3. Realignment or tolerance changes are needed

Give a clear, factual assessment.
`;
  const response = await callOpenAI(prompt);
  return response;
}
