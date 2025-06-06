// logScore.ts

import { ScoreBreakdown } from "./confidenceScorer";

export async function logManufacturabilityScore(
  partId: string,
  version: string,
  score: number,
  breakdown: ScoreBreakdown[]
) {
  const payload = {
    partId,
    version,
    score,
    breakdown,
    timestamp: new Date().toISOString()
  };

  await fetch("/api/log/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
