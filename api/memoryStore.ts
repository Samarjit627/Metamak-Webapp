// api/memoryStore.ts
import { PartMemory } from "../models/memory.model";

const memoryStore: Record<string, PartMemory> = {};

export function initMemory(partId: string): PartMemory {
  const newMemory: PartMemory = {
    partId,
    version: "v1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore[partId] = newMemory;
  return newMemory;
}

export function updateMemory(partId: string, update: Partial<PartMemory>): PartMemory | null {
  if (!memoryStore[partId]) return null;
  memoryStore[partId] = {
    ...memoryStore[partId],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  return memoryStore[partId];
}

export function getMemory(partId: string): PartMemory | null {
  return memoryStore[partId] || null;
}
