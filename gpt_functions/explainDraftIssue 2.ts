// gpt_functions/explainDraftIssue.ts
export function explainDraftIssue(angle: number, material: string): string {
  return `
This surface has a draft angle of only ${angle}°, which may lead to part sticking in the mold during ejection.

Recommended minimum draft for ${material} is 1.0°.

Consider increasing draft to improve mold release and avoid surface damage.
  `.trim();
}
