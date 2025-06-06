// logWallFeedback.ts

import { WallRiskResult } from "./wallScannerEngine";

export async function logWallFeedback(
  partId: string,
  walls: WallRiskResult[],
  decision: "accepted" | "rejected",
  reason: string,
  userRole: "Designer" | "Engineer" | "Procurement" | "Student" = "Designer"
) {
  const payload = {
    partId,
    walls,
    decision,
    reason,
    userRole,
    timestamp: new Date().toISOString()
  };

  await fetch("/api/log/wall-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
