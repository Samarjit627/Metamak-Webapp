// gptMemoryContext.ts

import { getWallMemory } from "./wallMemoryEngine";
import { getToleranceMemory } from "./toleranceMemoryEngine";
import { getRibMemory } from "./ribMemoryEngine";
import { getDraftMemory } from "./draftMemoryEngine";

export function getMemoryContext(material: string, process: string) {
  return {
    wallMemory: getWallMemory(material, process),
    toleranceMemory: getToleranceMemory(process, material),
    ribMemory: getRibMemory(material, process),
    draftMemory: getDraftMemory(process, material)
  };
}
