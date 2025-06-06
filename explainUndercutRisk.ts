// explainUndercutRisk.ts

import { UndercutRegion } from "./undercutScannerEngine";
import { citeFromKnowledge } from "./bookKnowledgePool";

export function explainUndercutRisk(
  undercut: UndercutRegion,
  process: string,
  material: string
): string {
  const citation = citeFromKnowledge("Undercut", material, process);
  const severity = typeof undercut.severity === "number" ? undercut.severity : 0;
  const loc = (undercut.location && Array.isArray(undercut.location)) ? `[${undercut.location.join(",")}]` : (undercut.description || "region");

  if (severity >= 0.85) {
    return `❗ Significant undercut at ${loc}. Consider redesigning or using collapsible cores for ${material}.` +
           (citation ? `\n\n${citation}` : "");
  }
  if (severity >= 0.5) {
    return `⚠️ Moderate undercut at ${loc}. Core lifters or slides may be needed for ${process}.` +
           (citation ? `\n\n${citation}` : "");
  }
  if (severity > 0) {
    return `⚠️ Minor undercut detected at ${loc}. May require side actions or hand finishing.` +
           (citation ? `\n\n${citation}` : "");
  }
  return "Undercut risk evaluation failed.";
}
