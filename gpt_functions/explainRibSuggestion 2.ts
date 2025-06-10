// gpt_functions/explainRibSuggestion.ts
import { RibSuggestion } from "../ribSuggestorEngine";

export function explainRibSuggestion(rib: RibSuggestion, material: string, wallThickness: number): string {
  return `
This rib is ${rib.thickness.toFixed(2)} mm thick and ${rib.height.toFixed(2)} mm tall, with a ${rib.draftAngle}° draft angle — optimized for injection molding in ${material}.

The rib thickness is around 0.5× the wall thickness (${wallThickness} mm), preventing sink marks.

A ${rib.filletRadius} mm fillet reduces stress concentrations at the base.

It improves structural strength on large flat surfaces while maintaining moldability.
  `.trim();
}
