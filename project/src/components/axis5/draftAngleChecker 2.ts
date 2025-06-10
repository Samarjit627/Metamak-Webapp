// draftAngleChecker.ts
export type Face = {
  id: string;
  center: [number, number, number];
  draftAngleDeg: number;
  normal: [number, number, number];
};

export type DraftIssue = {
  faceId: string;
  center: [number, number, number];
  draftAngle: number;
  normal: [number, number, number];
  confidenceScore: number;
};

export function detectUnderdraftedFaces(faces: Face[], minDraftDeg = 1.0): DraftIssue[] {
  return faces
    .filter(face => face.draftAngleDeg < minDraftDeg)
    .map(face => ({
      faceId: face.id,
      center: face.center,
      draftAngle: face.draftAngleDeg,
      normal: face.normal,
      confidenceScore: face.draftAngleDeg === 0 ? 0.3 : 0.6,
    }));
}
