// draftLogger.ts
import { DraftIssue } from "./draftAngleChecker";

export async function logDraftDecision(
  partId: string,
  decisions: DraftIssue[],
  decision: "accepted" | "rejected",
  reason: string,
  userRole: "Designer" | "Engineer" | "Procurement" | "Student"
) {
  const payload = {
    partId,
    decisions,
    decision,
    reason,
    userRole,
    timestamp: new Date().toISOString(),
  };

  await fetch(`/api/log/draft-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (decision === "accepted") {
    await fetch(`/api/version/v2/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partId, from: "draftAngleChecker" }),
    });
  }
}
