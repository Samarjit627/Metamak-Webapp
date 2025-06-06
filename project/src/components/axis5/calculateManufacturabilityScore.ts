// Axis5 Feature: Manufacturability Confidence Score
// Calculates a 0–100 score and summary for a part/version

export function calculateManufacturabilityScore({
  dfmPassRate,
  toleranceIssues,
  assemblyIssueCount,
  processMismatch,
  costToolingRisk,
  designIntentProvided,
}: {
  dfmPassRate: number;              // e.g., 0.85
  toleranceIssues: number;         // e.g., 2 issues flagged
  assemblyIssueCount: number;      // e.g., 1
  processMismatch: boolean;
  costToolingRisk: boolean;
  designIntentProvided: boolean;
}): { score: number; summary: string } {
  let score = 0;

  score += dfmPassRate * 30;

  if (toleranceIssues === 0) score += 20;
  else if (toleranceIssues === 1) score += 15;
  else if (toleranceIssues === 2) score += 10;

  if (assemblyIssueCount === 0) score += 20;
  else if (assemblyIssueCount === 1) score += 15;

  if (!processMismatch) score += 10;
  if (!costToolingRisk) score += 10;
  if (designIntentProvided) score += 10;

  const cappedScore = Math.min(100, Math.round(score));

  const summary = `✅ Manufacturability Score: ${cappedScore}/100\n\n- DFM Passed: ${Math.round(dfmPassRate * 100)}%\n- Tolerance Issues: ${toleranceIssues}\n- Assembly Issues: ${assemblyIssueCount}\n- Process Mismatch: ${processMismatch ? "Yes" : "No"}\n- Cost/Tooling Risk: ${costToolingRisk ? "Yes" : "No"}\n- Intent Provided: ${designIntentProvided ? "Yes" : "No"}`;

  return { score: cappedScore, summary };
}
