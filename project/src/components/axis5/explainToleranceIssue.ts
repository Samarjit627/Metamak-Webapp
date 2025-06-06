// explainToleranceIssue.ts

import { ToleranceIssue } from "./toleranceCheckerEngine";
import { citeFromKnowledge } from "./bookKnowledgePool";
import { wrapWithMentorTone } from "./wrapWithMentorTone";

export function explainToleranceIssue(issue: ToleranceIssue, process: string, material: string, mentorshipMode: boolean = false): string {
  const { appliedTolerance, recommendation, status, standard } = issue;
  const citation = citeFromKnowledge("Tolerance", material, process);

  if (status === "OK") {
    const baseMessage = `The applied tolerance of ±${appliedTolerance} mm is acceptable for ${process} with ${material}. No action required.` +
           (citation ? `\n\n${citation}` : "");
    return wrapWithMentorTone(baseMessage, "tolerance", mentorshipMode);
  }

  if (status === "Too Tight") {
    const baseMessage = `The tolerance ±${appliedTolerance} mm is too tight for ${process} with ${material}. This may lead to increased manufacturing cost or scrap rate.\n\n` +
      `Typical range is ±${recommendation} mm as per ${standard || "industry standards"}. Consider relaxing the tolerance.` +
           (citation ? `\n\n${citation}` : "");
    return wrapWithMentorTone(baseMessage, "tolerance", mentorshipMode);
  }

  if (status === "Too Loose") {
    return `The tolerance ±${appliedTolerance} mm is looser than necessary for ${process} with ${material}.\n\n` +
      `A tighter tolerance like ±${recommendation} mm (per ${standard || "standard guidelines"}) would ensure better fit or performance without extra cost.` +
           (citation ? `\n\n${citation}` : "");

  }

  return "Unable to evaluate this tolerance.";
}
