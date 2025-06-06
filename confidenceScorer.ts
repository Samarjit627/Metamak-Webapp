// confidenceScorer.ts

export type ScoreBreakdown = {
  category: string;
  score: number;     // 0–100
  weight: number;    // %
  penaltyReason?: string;
};

import { WallRiskResult } from "./wallScannerEngine";
import { UndercutRegion } from "./undercutScannerEngine";

export function calculateConfidenceScore(
  analysis: {
    draftIssues: number;
    draftTotal: number;
    toleranceIssues: number;
    toleranceTotal: number;
    ribCompliance: boolean;
    filletIssues: number;
    filletTotal: number;
    wallResults: WallRiskResult[];
    undercuts: UndercutRegion[];
  }
): { total: number; breakdown: ScoreBreakdown[] } {
  const breakdown: ScoreBreakdown[] = [];

  // Draft score (25%)
  const draftPassRate = 1 - analysis.draftIssues / (analysis.draftTotal || 1);
  breakdown.push({
    category: "Draft Angle",
    score: draftPassRate * 100,
    weight: 25,
    penaltyReason: analysis.draftIssues > 0 ? "Missing or under-drafted faces" : undefined,
  });

  // Tolerance score (25%)
  const tolPassRate = 1 - analysis.toleranceIssues / (analysis.toleranceTotal || 1);
  breakdown.push({
    category: "Tolerances",
    score: tolPassRate * 100,
    weight: 25,
    penaltyReason: analysis.toleranceIssues > 0 ? "Unrealistic tight or loose tolerances" : undefined,
  });

  // Rib score (20%)
  breakdown.push({
    category: "Rib DFM Compliance",
    score: analysis.ribCompliance ? 100 : 60,
    weight: 20,
    penaltyReason: analysis.ribCompliance ? undefined : "Ribs too thick, no draft, or too many",
  });

  // Fillet score (10%)
  const filletPassRate = 1 - analysis.filletIssues / (analysis.filletTotal || 1);
  breakdown.push({
    category: "Fillets",
    score: filletPassRate * 100,
    weight: 10,
    penaltyReason: analysis.filletIssues > 0 ? "Sharp internal edges" : undefined,
  });

  // Wall thickness score (10%) — now uses wallResults
  const riskyWalls = analysis.wallResults.filter(w => w.status !== "OK");
  const wallPassRate = 1 - riskyWalls.length / (analysis.wallResults.length || 1);
  const wallAverageSeverity = riskyWalls.length
    ? riskyWalls.reduce((sum, w) => sum + w.severity, 0) / riskyWalls.length
    : 0;

  breakdown.push({
    category: "Wall Thickness",
    score: wallPassRate * 100,
    weight: 10,
    penaltyReason: wallAverageSeverity > 0.3 ? "Too thin or thick walls" : undefined,
  });

  // Undercut score (10%) — new logic
  const undercuts = analysis.undercuts || [];
  const undercutCount = undercuts.length;
  const undercutAverageSeverity = undercuts.length
    ? undercuts.reduce((sum, u) => sum + u.severity, 0) / undercuts.length
    : 0;

  let undercutScore = 100;
  if (undercutCount > 0) {
    if (undercutAverageSeverity >= 0.85) undercutScore = 60;
    else if (undercutAverageSeverity >= 0.5) undercutScore = 75;
    else undercutScore = 85;
  }

  breakdown.push({
    category: "Process Compatibility (Undercuts)",
    score: undercutScore,
    weight: 10,
    penaltyReason: undercutCount > 0 ? `Detected ${undercutCount} undercut(s)` : undefined,
  });

  // Final total (weighted average)
  const total = breakdown.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0);

  return { total: Math.round(total), breakdown };
}
