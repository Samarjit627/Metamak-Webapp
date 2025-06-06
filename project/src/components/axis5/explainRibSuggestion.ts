import { citeFromKnowledge } from "./bookKnowledgePool";
import { wrapWithMentorTone } from "./wrapWithMentorTone";

export function explainRibSuggestion(ratio: number, material: string, process: string, mentorshipMode: boolean = false): string {
  const citation = citeFromKnowledge("Rib", material, process);

  const baseMessage = ratio <= 0.5
    ? `✅ Rib thickness ratio (${ratio.toFixed(2)}× wall) is within best practice for ${material} in ${process}.`
    : `⚠️ Rib thickness ratio is ${ratio.toFixed(2)}× wall — may cause sink marks or warping.
Try reducing to 0.5× or less for optimal molding.`;

  return wrapWithMentorTone(baseMessage + (citation ? `\n\n${citation}` : ""), "rib", mentorshipMode);
}
