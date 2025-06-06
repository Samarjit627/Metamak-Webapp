// toleranceCheckerEngine.ts
import { getToleranceBand } from "./toleranceRules";

export type ToleranceIssue = {
  featureId: string;
  location: [number, number, number];  // XYZ center of the feature
  appliedTolerance: number;            // from CAD or user input
  status: "OK" | "Too Tight" | "Too Loose";
  recommendation: number;
  standard?: string;
};

export function checkTolerances(
  features: { id: string, location: [number, number, number], tolerance: number }[],
  process: string,
  material: string
): ToleranceIssue[] {
  const band = getToleranceBand(process, material);
  if (!band) return [];

  return features.map((feature) => {
    const t = feature.tolerance;
    let status: ToleranceIssue["status"] = "OK";

    if (t < band.min) status = "Too Tight";
    else if (t > band.max) status = "Too Loose";

    return {
      featureId: feature.id,
      location: feature.location,
      appliedTolerance: t,
      status,
      recommendation: band.recommended,
      standard: band.standard,
    };
  });
}
