// ribSuggestorEngine.ts
import { getRibParams } from "./ribRules";

type Face = {
  id: string;
  normal: [number, number, number];
  area: number; // mm^2
  center: [number, number, number]; // face center position
};

export type RibSuggestion = {
  parentFaceId: string;
  position: [number, number, number];
  direction: [number, number, number];
  width: number;
  height: number;
  thickness: number;
  draftAngle: number;
  filletRadius: number;
  confidenceScore: number; // 0–1
};

export function suggestRibsFromFaces(
  faces: Face[],
  wallThickness: number,
  material: string = "ABS",
  minArea: number = 500 // mm^2
): RibSuggestion[] {
  const suggestions: RibSuggestion[] = [];
  const ribParams = getRibParams(wallThickness, material);

  for (const face of faces) {
    // Filter only large vertical-ish flat faces
    const [nx, ny, nz] = face.normal;
    const isFlatWall = face.area > minArea && Math.abs(nz) < 0.2;

    if (!isFlatWall) continue;

    const ribsPerWall = Math.floor(face.area / 1000); // one rib per 1000 mm^2
    const baseX = face.center[0];
    const baseY = face.center[1];
    const baseZ = face.center[2];

    for (let i = 0; i < ribsPerWall; i++) {
      suggestions.push({
        parentFaceId: face.id,
        position: [
          baseX + i * ribParams.spacing,
          baseY,
          baseZ,
        ],
        direction: face.normal,
        width: ribParams.ribThickness, // width = rib thickness (for extrusion direction)
        height: ribParams.ribHeight,
        thickness: ribParams.ribThickness,
        draftAngle: ribParams.draftAngleDeg,
        filletRadius: ribParams.filletRadius,
        confidenceScore: 0.8 // Placeholder: improve with real heuristics
      });
    }
  }

  return suggestions;
}
