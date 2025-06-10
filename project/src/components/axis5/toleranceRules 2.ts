// toleranceRules.ts

export type ToleranceBand = {
  min: number;   // in mm
  max: number;   // in mm
  recommended: number; // default suggestion
  standard?: string;   // optional ISO reference
};

type ToleranceMap = Record<string, Record<string, ToleranceBand>>;

export const toleranceRules: ToleranceMap = {
  "CNC": {
    "Aluminum":     { min: 0.02, max: 0.1, recommended: 0.05, standard: "ISO 2768-f" },
    "Steel":        { min: 0.02, max: 0.08, recommended: 0.04, standard: "ISO 2768-f" },
    "Brass":        { min: 0.02, max: 0.1, recommended: 0.06, standard: "ISO 2768-m" },
  },
  "Injection Molding": {
    "ABS":          { min: 0.05, max: 0.25, recommended: 0.1, standard: "SPI M-2" },
    "Polycarbonate":{ min: 0.05, max: 0.15, recommended: 0.1, standard: "SPI M-1" },
    "Nylon":        { min: 0.1, max: 0.3, recommended: 0.2, standard: "SPI M-2" },
  },
  "Sheet Metal": {
    "Mild Steel":   { min: 0.3, max: 1.0, recommended: 0.5, standard: "DIN 6930" },
    "Aluminum":     { min: 0.2, max: 0.8, recommended: 0.5, standard: "DIN 6930" },
  },
  "Sand Casting": {
    "Steel":        { min: 1.5, max: 3.0, recommended: 2.0, standard: "ISO 8062-3" },
    "Aluminum":     { min: 1.0, max: 2.5, recommended: 1.5, standard: "ISO 8062-3" },
  }
};

export function getToleranceBand(process: string, material: string): ToleranceBand | null {
  const proc = toleranceRules[process];
  if (!proc) return null;

  const mat = Object.keys(proc).find(m => material.toLowerCase().includes(m.toLowerCase()));
  return mat ? proc[mat] : null;
}
