// ribRules.ts

type RibParams = {
  ribThickness: number;     // mm
  ribHeight: number;        // mm
  draftAngleDeg: number;    // degrees
  filletRadius: number;     // mm
  spacing: number;          // mm
};

export function getRibParams(
  wallThickness: number,
  material: string = "ABS"
): RibParams {
  const ribThicknessRatio = 0.5; // default 0.4x–0.6x wall
  const maxHeightRatio = 3.0;    // height ≤ 3x rib thickness
  const draftAngle = 1.0;        // standard 1° per side
  const filletRadius = 0.25;     // mm
  const spacingBase = 5;         // mm

  const ribThickness = parseFloat((wallThickness * ribThicknessRatio).toFixed(2));
  const ribHeight = parseFloat((ribThickness * maxHeightRatio).toFixed(2));

  // Adjustments by material (example)
  if (material.toLowerCase().includes("nylon")) {
    return {
      ribThickness: parseFloat((ribThickness * 0.9).toFixed(2)),
      ribHeight: parseFloat((ribHeight * 0.9).toFixed(2)),
      draftAngleDeg: 0.5,
      filletRadius,
      spacing: parseFloat((spacingBase * 0.8).toFixed(2)),
    };
  }

  if (material.toLowerCase().includes("polycarbonate")) {
    return {
      ribThickness,
      ribHeight,
      draftAngleDeg: 1.5,
      filletRadius: 0.35,
      spacing: spacingBase,
    };
  }

  return {
    ribThickness,
    ribHeight,
    draftAngleDeg: draftAngle,
    filletRadius,
    spacing: spacingBase,
  };
}
