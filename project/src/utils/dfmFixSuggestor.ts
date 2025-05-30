export function getFixRecommendations(issueType: string): string {
  const recommendations: Record<string, string> = {
    thinWalls: "Increase wall thickness to at least 1.5mm",
    undercuts: "Add draft angles or redesign with side core",
    sharpCorners: "Add 1–2mm fillets to reduce stress concentrations",
    smallHoles: "Increase hole diameter to minimum 2mm",
    lowDraft: "Add 1–2° draft angle to vertical faces",
    ribs: "Thicken ribs and add fillets at base for strength",
    bosses: "Add gussets/fillets to support bosses and avoid sink marks",
    wallTransitions: "Smooth abrupt wall thickness transitions; add coring if possible",
    sinkWarpage: "Add coring or reduce thickness to minimize sink/warpage risk",
    closeFeatures: "Increase spacing between holes/slots and edges",
    internalText: "Enlarge or shallow text/logos for manufacturability",
    ejection: "Add draft angles, ejector pads, or split part for easier ejection"
  };

  return recommendations[issueType] || "No recommendation available.";
}

export function getAllFixRecommendations(): Record<string, string> {
  return {
    thinWalls: "Increase wall thickness to at least 1.5mm",
    undercuts: "Add draft angles or redesign with side core",
    sharpCorners: "Add 1–2mm fillets to reduce stress concentrations",
    smallHoles: "Increase hole diameter to minimum 2mm",
    lowDraft: "Add 1–2° draft angle to vertical faces",
    ribs: "Thicken ribs and add fillets at base for strength",
    bosses: "Add gussets/fillets to support bosses and avoid sink marks",
    wallTransitions: "Smooth abrupt wall thickness transitions; add coring if possible",
    sinkWarpage: "Add coring or reduce thickness to minimize sink/warpage risk",
    closeFeatures: "Increase spacing between holes/slots and edges",
    internalText: "Enlarge or shallow text/logos for manufacturability",
    ejection: "Add draft angles, ejector pads, or split part for easier ejection"
  };
}