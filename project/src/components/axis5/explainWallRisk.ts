// explainWallRisk.ts

import { WallRiskResult } from "./wallScannerEngine";
import { citeFromKnowledge } from "./bookKnowledgePool";
import { wrapWithMentorTone } from "./wrapWithMentorTone";

export function explainWallRisk(
  wall: WallRiskResult,
  process: string,
  material: string,
  mentorshipMode: boolean = false
): string {
  const citation = citeFromKnowledge("Wall Thickness", material, process);
  let message = "";

  if (wall.status === "OK") {
    message = `✅ This wall has an acceptable thickness of ${wall.thickness.toFixed(2)} mm for ${process} with ${material}.` +
           (citation ? `\n\n${citation}` : "");
  } else if (wall.status === "Too Thin") {
    message = `⚠️ The wall at [${wall.location.join(",")}] is too thin (${wall.thickness.toFixed(2)} mm).\nRecommended minimum: ${wall.recommended} mm for ${material}.\nRisk: warping, voids, or incomplete fill.` +
           (citation ? `\n\n${citation}` : "");
  } else if (wall.status === "Too Thick") {
    message = `⚠️ The wall at [${wall.location.join(",")}] is too thick (${wall.thickness.toFixed(2)} mm).\nRecommended maximum: ~${(wall.recommended * 1.75).toFixed(1)} mm.\nRisk: sink marks, uneven cooling.` +
           (citation ? `\n\n${citation}` : "");
  } else if (wall.status === "Borderline") {
    message = `⚠️ This wall is borderline (${wall.thickness.toFixed(2)} mm). Best practice for ${material} in ${process} suggests around ${wall.recommended} mm.` +
           (citation ? `\n\n${citation}` : "");
  } else {
    message = "⚠️ Wall thickness evaluation failed.";
  }

  return wrapWithMentorTone(message, "wall", mentorshipMode);
}

