// toleranceMemoryEngine.ts

type ToleranceMemory = {
  process: string;
  material: string;
  preferredMin: number;
  preferredMax: number;
  overrideNotes?: string;
};

let toleranceMemoryStore: Record<string, ToleranceMemory> = {};

export function updateToleranceMemory(process: string, material: string, data: Partial<ToleranceMemory>) {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  toleranceMemoryStore[key] = {
    ...toleranceMemoryStore[key],
    process,
    material,
    ...data,
  };
}

export function getToleranceMemory(process: string, material: string): ToleranceMemory | null {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  return toleranceMemoryStore[key] || null;
}
