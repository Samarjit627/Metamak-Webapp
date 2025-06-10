import { citeFromKnowledge } from "./bookKnowledgePool";
import { wrapWithMentorTone } from "./wrapWithMentorTone";

export function explainDraftRisk(faceCount: number, material: string, process: string, mentorshipMode: boolean = false): string {
  const citation = citeFromKnowledge("Draft", material, process);

  const baseMessage = faceCount === 0
    ? `✅ All vertical faces have adequate draft for ${material} (${process}).`
    : `⚠️ ${faceCount} vertical face(s) are under-drafted or have 0° draft, which can cause ejection difficulty or surface drag in ${process}.
Minimum suggested: 1°–2° draft.`;

  return wrapWithMentorTone(baseMessage + (citation ? `\n\n${citation}` : ""), "draft", mentorshipMode);
}
