// ribLogger.ts
import { RibSuggestion } from "./ribSuggestorEngine";

export async function logRibDecision(
  partId: string,
  ribs: RibSuggestion[],
  decision: "accepted" | "rejected",
  reason: string,
  userRole: "Designer" | "Engineer" | "Procurement" | "Student"
) {
  const payload = {
    partId,
    ribs,
    decision,
    reason,
    userRole,
    timestamp: new Date().toISOString(),
  };

  await fetch(`/api/log/rib-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (decision === "accepted") {
    await fetch(`/api/version/v2/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partId, from: "ribSuggestor" }),
    });
  }
}
