// draftMemoryEngine.ts

type DraftMemory = {
  process: string;
  material: string;
  preferredDraft: number;
  notes?: string;
};

let draftMemoryStore: Record<string, DraftMemory> = {};

export function updateDraftMemory(process: string, material: string, data: Partial<DraftMemory>) {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  draftMemoryStore[key] = {
    ...draftMemoryStore[key],
    process,
    material,
    ...data,
  };
}

export function getDraftMemory(process: string, material: string): DraftMemory | null {
  const key = `${process.toLowerCase()}__${material.toLowerCase()}`;
  return draftMemoryStore[key] || null;
}
