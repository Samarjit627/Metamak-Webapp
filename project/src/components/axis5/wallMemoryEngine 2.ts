// wallMemoryEngine.ts

type WallMemory = {
  material: string;
  process: string;
  preferredMin: number;
  overrideBehavior: string;
  userNotes?: string;
};

let wallMemoryStore: Record<string, WallMemory> = {};

export function updateWallMemory(material: string, process: string, data: Partial<WallMemory>) {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  wallMemoryStore[key] = {
    ...wallMemoryStore[key],
    material,
    process,
    ...data,
  };
}

export function getWallMemory(material: string, process: string): WallMemory | null {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  return wallMemoryStore[key] || null;
}
