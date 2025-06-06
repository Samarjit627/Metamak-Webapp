// ribMemoryEngine.ts

type RibMemory = {
  material: string;
  process: string;
  preferredRatio: number; // rib thickness / wall thickness
  maxHeight?: number;
  notes?: string;
};

let ribMemoryStore: Record<string, RibMemory> = {};

export function updateRibMemory(material: string, process: string, data: Partial<RibMemory>) {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  ribMemoryStore[key] = {
    ...ribMemoryStore[key],
    material,
    process,
    ...data,
  };
}

export function getRibMemory(material: string, process: string): RibMemory | null {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  return ribMemoryStore[key] || null;
}
