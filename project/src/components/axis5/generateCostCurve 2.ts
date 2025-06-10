// generateCostCurve.ts
export function generateCostCurve({
  baseCost,
  costDropRate = 0.85,
  breakpoints = [1, 10, 50, 100, 500, 1000],
}: {
  baseCost: number;
  costDropRate?: number;
  breakpoints?: number[];
}) {
  return breakpoints.map(qty => ({
    quantity: qty,
    unitCost: +(baseCost * Math.pow(costDropRate, Math.log10(qty))).toFixed(2),
  }));
}
