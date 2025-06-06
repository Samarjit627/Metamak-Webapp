// generateV2Summary.ts

import { getMemoryContext } from "./gptMemoryContext";

export function generateV2Summary(diffData, process, material, memoryMode = true) {
  const { toleranceMemory, wallMemory } = getMemoryContext(material, process);
  let summary = [];

  if (diffData.toleranceChange) {
    const tol = diffData.toleranceChange.new;
    const refNote =
      memoryMode &&
      toleranceMemory &&
      tol >= toleranceMemory.preferredMin &&
      tol <= toleranceMemory.preferredMax
        ? " — aligned with your accepted tolerance range for " + material
        : "";
    summary.push(`Tolerance changed to ±${tol} mm${refNote}.`);
  }

  if (diffData.wallChange) {
    const w = diffData.wallChange.new;
    const refNote =
      memoryMode && wallMemory && w >= wallMemory.preferredMin
        ? " — consistent with your preferred min wall for " + material
        : "";
    summary.push(`Wall thickness changed to ${w} mm${refNote}.`);
  }

  // ... other DFM differences
  if (diffData.filletChange) {
    summary.push(`Fillets added to sharp corners to reduce stress concentration.`);
  }

  // Add more DFM-aware logic as needed
  return summary.join("\n");
}
