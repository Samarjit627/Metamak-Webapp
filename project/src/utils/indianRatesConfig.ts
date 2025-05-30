// Centralized Indian market rates for manufacturing (2025)
// You can update these values via a UI panel or manually.

export const baseToolingRates: Record<string, number> = {
  "Injection Molding": 80000, // Lowered for Indian SME market
  "Compression Molding": 90000,
  "Transfer Molding": 85000,
  "Die Casting": 120000,
  "Vacuum Forming": 35000,
  "Sheet Metal": 40000,
  "3D Printing": 0,
  "CNC Machining": 5000
};

export const processPricingMatrix: Record<string, Array<{
  minQty: number;
  maxQty: number;
  unitPrice: number;
  toolingCost?: number;
  setupCost?: number;
}>> = {
  '3d_printing_fdm': [
    { minQty: 1, maxQty: 10, unitPrice: 800, setupCost: 300 },
    { minQty: 11, maxQty: 100, unitPrice: 500, setupCost: 500 },
    { minQty: 101, maxQty: 1000, unitPrice: 320, setupCost: 1200 },
    { minQty: 1001, maxQty: Infinity, unitPrice: 200, setupCost: 1800 }
  ],
  'injection_molding': [
    { minQty: 1, maxQty: 99, unitPrice: 1200, setupCost: 6000 },
    { minQty: 100, maxQty: 999, unitPrice: 600, toolingCost: 40000, setupCost: 12000 },
    { minQty: 1000, maxQty: 9999, unitPrice: 260, toolingCost: 80000, setupCost: 20000 },
    { minQty: 10000, maxQty: Infinity, unitPrice: 120, toolingCost: 120000, setupCost: 35000 }
  ],
  'die_casting': [
    { minQty: 1, maxQty: 99, unitPrice: 2200, setupCost: 9000 },
    { minQty: 100, maxQty: 999, unitPrice: 1100, toolingCost: 40000, setupCost: 12000 },
    { minQty: 1000, maxQty: 9999, unitPrice: 420, toolingCost: 80000, setupCost: 20000 },
    { minQty: 10000, maxQty: Infinity, unitPrice: 180, toolingCost: 120000, setupCost: 35000 }
  ],
  'cnc_metal': [
    { minQty: 1, maxQty: 9, unitPrice: 2200, setupCost: 3000 },
    { minQty: 10, maxQty: 49, unitPrice: 1600, setupCost: 4000 },
    { minQty: 50, maxQty: 199, unitPrice: 1200, setupCost: 6000 },
    { minQty: 200, maxQty: Infinity, unitPrice: 900, setupCost: 9000 }
  ]
};
