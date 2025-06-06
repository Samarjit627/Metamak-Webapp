import { citeFromKnowledge } from "./bookKnowledgePool";

export function explainFilletRisk(fillet: {radius: number, recommended: number, location?: number[]}, material: string, process: string): string {
  const citation = citeFromKnowledge("Fillet", material, process);

  if (fillet.radius >= fillet.recommended) {
    return `✅ Fillet radius (${fillet.radius} mm) meets or exceeds best practice for ${material} in ${process}.` +
           (citation ? `\n\n${citation}` : "");
  }

  return `⚠️ Fillet at ${(fillet.location ? `[${fillet.location.join(",")}]` : "region")} is too small (${fillet.radius} mm).\nRecommended: ≥${fillet.recommended} mm for ${material}.\nRisk: stress risers or crack initiation.` +
         (citation ? `\n\n${citation}` : "");
}
