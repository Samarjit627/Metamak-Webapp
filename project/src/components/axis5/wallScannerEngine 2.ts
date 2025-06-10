// wallScannerEngine.ts

import { getWallSpec } from "./wallThicknessRules";

export type WallRegion = {
  id: string;
  location: [number, number, number]; // center of wall
  thickness: number; // in mm
};

export type WallRiskResult = {
  id: string;
  location: [number, number, number];
  thickness: number;
  status: "Too Thin" | "Too Thick" | "Borderline" | "OK";
  recommended: number;
  severity: number; // 0–1
  notes?: string;
};

export function analyzeWallRegions(
  walls: WallRegion[],
  process: string,
  material: string
): WallRiskResult[] {
  const spec = getWallSpec(process, material);
  if (!spec) return [];

  return walls.map((w) => {
    let status: WallRiskResult["status"] = "OK";
    let severity = 0;

    if (w.thickness < spec.min) {
      status = "Too Thin";
      severity = 1 - w.thickness / spec.min;
    } else if (w.thickness > spec.max) {
      status = "Too Thick";
      severity = (w.thickness - spec.max) / spec.max;
    } else if (Math.abs(w.thickness - spec.recommended) > 0.5) {
      status = "Borderline";
      severity = 0.3;
    }

    return {
      id: w.id,
      location: w.location,
      thickness: w.thickness,
      status,
      recommended: spec.recommended,
      severity: parseFloat(severity.toFixed(2)),
      notes: spec.notes,
    };
  });
}
