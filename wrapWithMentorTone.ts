// wrapWithMentorTone.ts

export function wrapWithMentorTone(message: string, type: "wall" | "draft" | "rib" | "tolerance", mentorshipMode: boolean = false): string {
  if (!mentorshipMode) return message;

  const intro = {
    wall: "Let’s take a closer look at this wall thickness —",
    draft: "Draft angles can be tricky — here’s what you might want to know:",
    rib: "Rib design plays a big role in molding success —",
    tolerance: "Tolerances are often misunderstood — let's break it down:"
  }[type];

  const outro = {
    wall: "Consider gently thickening this region if warping or voids are a concern.",
    draft: "A bit more draft can help with easier ejection and surface finish.",
    rib: "Reducing rib thickness may help you avoid cosmetic sink marks.",
    tolerance: "If this tolerance feels tight, consider what level is functionally necessary."
  }[type];

  return `${intro}\n\n${message}\n\n${outro}`;
}

