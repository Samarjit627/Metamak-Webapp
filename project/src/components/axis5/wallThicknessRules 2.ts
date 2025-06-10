// wallThicknessRules.ts

export type WallSpec = {
  min: number;    // mm
  max: number;    // mm
  recommended: number; // mm
  notes?: string;
};

type WallMap = Record<string, Record<string, WallSpec>>;

export const wallThicknessRules: WallMap = {
  "Injection Molding": {
    "ABS":           { min: 1.0, max: 3.5, recommended: 2.0, notes: "Thinner walls warp easily; thicker walls sink." },
    "Polycarbonate": { min: 1.0, max: 3.0, recommended: 1.5 },
    "Nylon":         { min: 0.75, max: 3.0, recommended: 1.5 },
  },
  "CNC": {
    "Aluminum":      { min: 0.5, max: 10, recommended: 2.0 },
    "Steel":         { min: 0.8, max: 12, recommended: 3.0 },
  },
  "Sheet Metal": {
    "Mild Steel":    { min: 0.5, max: 6.0, recommended: 1.0 },
    "Aluminum":      { min: 0.4, max: 5.0, recommended: 1.0 },
  },
  "3D Printing": {
    "PLA":           { min: 0.8, max: 5.0, recommended: 1.2 },
    "PETG":          { min: 1.0, max: 6.0, recommended: 1.5 },
  }
};

export function getWallSpec(process: string, material: string): WallSpec | null {
  const proc = wallThicknessRules[process];
  if (!proc) return null;

  const mat = Object.keys(proc).find(m => material.toLowerCase().includes(m.toLowerCase()));
  return mat ? proc[mat] : null;
}
