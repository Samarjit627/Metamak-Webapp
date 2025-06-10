// logToleranceFeedback.ts

import { ToleranceIssue } from "./toleranceCheckerEngine";

export async function logToleranceFeedback(
  partId: string,
  issues: ToleranceIssue[],
  decision: "accepted" | "rejected",
  reason: string,
  userRole: "Designer" | "Engineer" | "Procurement" | "Student" = "Designer"
) {
  const payload = {
    partId,
    issues,
    decision,
    reason,
    userRole,
    timestamp: new Date().toISOString()
  };

  await fetch("/api/log/tolerance-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
