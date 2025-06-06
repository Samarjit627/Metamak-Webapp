// explainScore.ts

import { ScoreBreakdown } from "./confidenceScorer";

export function explainScore(total: number, breakdown: ScoreBreakdown[]): string {
  const summary: string[] = [];

  if (total >= 85) {
    summary.push("✅ This part is highly manufacturable and likely production-ready.");
  } else if (total >= 60) {
    summary.push("⚠️ This part is moderately manufacturable but needs improvements in key areas.");
  } else {
    summary.push("❌ This part has high manufacturability risk. Review the flagged issues below.");
  }

  for (const b of breakdown) {
    if (b.score < 85 && b.penaltyReason) {
      summary.push(
        `• ${b.category} scored ${Math.round(b.score)}/100 — ${b.penaltyReason}. Consider improvements.`
      );
    }
  }

  return summary.join("\n");
}
