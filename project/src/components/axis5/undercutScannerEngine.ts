// undercutScannerEngine.ts

type Face = {
  id: string;
  normal: [number, number, number]; // Unit vector
  center: [number, number, number];
};

export type UndercutRegion = {
  id: string;
  center: [number, number, number];
  severity: number; // 0–1
};

export function detectUndercuts(faces: Face[], toolDirection: [number, number, number] = [0, 0, 1]): UndercutRegion[] {
  const [tx, ty, tz] = toolDirection;

  const undercuts: UndercutRegion[] = [];

  for (const face of faces) {
    const [nx, ny, nz] = face.normal;
    const dotProduct = nx * tx + ny * ty + nz * tz; // cosine of angle between face normal and tool direction

    // If angle is negative, the face is facing away from tool — potential undercut
    if (dotProduct < -0.1) {
      undercuts.push({
        id: face.id,
        center: face.center,
        severity: Math.abs(dotProduct), // deeper angle = higher severity
      });
    }
  }

  return undercuts;
}

