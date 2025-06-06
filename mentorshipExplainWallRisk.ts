import { WallRiskResult } from "./wallScannerEngine";
import { citeFromKnowledge } from "./bookKnowledgePool";

/**
 * Mentorship Mode: Explains wall risk with supportive, educational, and context-rich language.
 * @param wall WallRiskResult
 * @param process Manufacturing process
 * @param material Material
 */
export function mentorshipExplainWallRisk(
  wall: WallRiskResult,
  process: string,
  material: string
): string {
  const citation = citeFromKnowledge("Wall Thickness", material, process);
  const wallDesc = `(${wall.thickness.toFixed(2)} mm)`;

  if (wall.status === "OK") {
    return `👍 Great job! This wall thickness ${wallDesc} is well within best practice for ${material} in ${process}. Keeping walls in this range helps avoid issues like warping or short shots.` +
           (citation ? `\n\n${citation}` : "");
  }

  if (wall.status === "Too Thin") {
    return `🧐 This wall is a bit thin ${wallDesc}, and while it may work in some cases, it increases the chance of warping or incomplete fill — especially for ${material}. Typically, designers aim for around ${wall.recommended} mm here. Let’s explore what happens if you thicken it slightly.` +
           (citation ? `\n\n${citation}` : "");
  }

  if (wall.status === "Too Thick") {
    return `🤔 This wall is on the thick side ${wallDesc}. While thicker walls can add strength, they may also cause sink marks or slow cooling. For ${material}, try to keep it closer to ${wall.recommended} mm if possible.` +
           (citation ? `\n\n${citation}` : "");
  }

  if (wall.status === "Borderline") {
    return `⚠️ This wall is borderline at ${wallDesc}. It’s not immediately risky, but best practice for ${material} in ${process} is about ${wall.recommended} mm. If you can, nudge it toward the recommended value for extra reliability.` +
           (citation ? `\n\n${citation}` : "");
  }

  return "Could not generate mentorship explanation for wall thickness.";
}
