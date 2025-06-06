// prototypeProductionMode.ts
export type ProductionMode = "prototype" | "production";

let mode: ProductionMode = "prototype";

export function setProductionMode(newMode: ProductionMode) {
  mode = newMode;
}

export function getProductionMode(): ProductionMode {
  return mode;
}

export function getDFMStrictness(): "relaxed" | "strict" {
  return mode === "production" ? "strict" : "relaxed";
}
