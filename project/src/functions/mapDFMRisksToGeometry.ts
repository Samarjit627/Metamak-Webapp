import { DFMFaceRisk } from './dfmRiskFunctions';
import { Vector3 } from 'three';

// Feature arrays should be of the form: { faceIndex: number, position: Vector3, ... }
export interface DetectedFeatures {
  thinWalls: { faceIndex: number; position: Vector3; thickness: number }[];
  sharpCorners: { faceIndex: number; position: Vector3; angle: number }[];
  undercuts: { faceIndex: number; position: Vector3; angle: number }[];
}

export interface ParsedRisk {
  type: 'thin_wall' | 'sharp_corner' | 'undercut';
  riskScore: number;
  // Optionally: position, value, etc.
}

/**
 * Maps parsed GPT risks to detected geometry features, assigning the correct face index for heatmap coloring.
 * @param parsedRisks Array of risks parsed from GPT summary (type, riskScore, [position/value])
 * @param features Detected features from geometry analysis
 * @returns Array of DFMFaceRisk objects with valid faceIndex, type, and riskScore
 */
export function mapDFMRisksToGeometry(
  parsedRisks: ParsedRisk[],
  features: DetectedFeatures
): DFMFaceRisk[] {
  const mapped: DFMFaceRisk[] = [];
  const usedFaceIndices = new Set<number>();

  parsedRisks.forEach(risk => {
    let candidates: any[] = [];
    if (risk.type === 'thin_wall') candidates = features.thinWalls;
    else if (risk.type === 'sharp_corner') candidates = features.sharpCorners;
    else if (risk.type === 'undercut') candidates = features.undercuts;
    if (!candidates.length) return;

    // Pick the closest unused feature (by position if available)
    let bestIdx = -1;
    let bestDist = Infinity;
    // If risk has a position, use it; else just pick first unused
    let riskPos = (risk as any).position as Vector3 | undefined;
    candidates.forEach((feature, idx) => {
      if (usedFaceIndices.has(feature.faceIndex)) return;
      let dist = 0;
      if (riskPos && feature.position) {
        dist = riskPos.distanceTo(feature.position);
      }
      if (!riskPos) dist = 0; // fallback: just pick first unused
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    if (bestIdx !== -1) {
      const feature = candidates[bestIdx];
      mapped.push({
        faceIndex: feature.faceIndex,
        type: risk.type,
        riskScore: risk.riskScore
      });
      usedFaceIndices.add(feature.faceIndex);
    }
  });
  return mapped;
}
