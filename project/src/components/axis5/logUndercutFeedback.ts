// logUndercutFeedback.ts

import { UndercutRegion } from "./undercutScannerEngine";

export async function logUndercutFeedback(
  partId: string,
  regions: UndercutRegion[],
  decision: "accepted" | "rejected",
  reason: string,
  userRole: "Designer" | "Engineer" | "Procurement" | "Student" = "Engineer"
) {
  const payload = {
    partId,
    regions,
    decision,
    reason,
    userRole,
    timestamp: new Date().toISOString()
  };

  await fetch("/api/log/undercut-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
