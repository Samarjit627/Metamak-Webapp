// Base pricing matrix for Indian manufacturing market (2024)
interface PricingBracket {
  minQty: number;
  maxQty: number;
  unitPrice: number;
  toolingCost?: number;
  setupCost?: number;
}

export const processPricingMatrix: Record<string, PricingBracket[]> = {
  'injection_molding': [
    { minQty: 1, maxQty: 99, unitPrice: 2500, setupCost: 15000 },
    { minQty: 100, maxQty: 999, unitPrice: 1200, toolingCost: 80000, setupCost: 25000 },
    { minQty: 1000, maxQty: 9999, unitPrice: 450, toolingCost: 150000, setupCost: 35000 },
    { minQty: 10000, maxQty: Infinity, unitPrice: 180, toolingCost: 250000, setupCost: 50000 }
  ],
  '3d_printing_fdm': [
    { minQty: 1, maxQty: 9, unitPrice: 1800, setupCost: 2000 },
    { minQty: 10, maxQty: 49, unitPrice: 1200, setupCost: 3500 },
    { minQty: 50, maxQty: 199, unitPrice: 800, setupCost: 5000 },
    { minQty: 200, maxQty: Infinity, unitPrice: 600, setupCost: 8000 }
  ],
  '3d_printing_sla': [
    { minQty: 1, maxQty: 9, unitPrice: 2500, setupCost: 3000 },
    { minQty: 10, maxQty: 49, unitPrice: 1800, setupCost: 4500 },
    { minQty: 50, maxQty: 199, unitPrice: 1200, setupCost: 6000 },
    { minQty: 200, maxQty: Infinity, unitPrice: 900, setupCost: 10000 }
  ],
  'cnc_plastic': [
    { minQty: 1, maxQty: 9, unitPrice: 3500, setupCost: 5000 },
    { minQty: 10, maxQty: 49, unitPrice: 2800, setupCost: 8000 },
    { minQty: 50, maxQty: 199, unitPrice: 2200, setupCost: 12000 },
    { minQty: 200, maxQty: Infinity, unitPrice: 1800, setupCost: 18000 }
  ],
  'cnc_metal': [
    { minQty: 1, maxQty: 9, unitPrice: 5500, setupCost: 8000 },
    { minQty: 10, maxQty: 49, unitPrice: 4200, setupCost: 12000 },
    { minQty: 50, maxQty: 199, unitPrice: 3500, setupCost: 18000 },
    { minQty: 200, maxQty: Infinity, unitPrice: 2800, setupCost: 25000 }
  ],
  'die_casting': [
    { minQty: 1, maxQty: 99, unitPrice: 4500, setupCost: 20000 },
    { minQty: 100, maxQty: 999, unitPrice: 2200, toolingCost: 150000, setupCost: 35000 },
    { minQty: 1000, maxQty: 9999, unitPrice: 850, toolingCost: 250000, setupCost: 50000 },
    { minQty: 10000, maxQty: Infinity, unitPrice: 380, toolingCost: 350000, setupCost: 75000 }
  ],
  'vacuum_forming': [
    { minQty: 1, maxQty: 99, unitPrice: 1800, setupCost: 12000 },
    { minQty: 100, maxQty: 999, unitPrice: 950, toolingCost: 45000, setupCost: 18000 },
    { minQty: 1000, maxQty: 9999, unitPrice: 450, toolingCost: 75000, setupCost: 25000 },
    { minQty: 10000, maxQty: Infinity, unitPrice: 220, toolingCost: 120000, setupCost: 35000 }
  ],
  'sheet_metal': [
    { minQty: 1, maxQty: 9, unitPrice: 2800, setupCost: 6000 },
    { minQty: 10, maxQty: 49, unitPrice: 1900, setupCost: 10000 },
    { minQty: 50, maxQty: 199, unitPrice: 1200, setupCost: 15000 },
    { minQty: 200, maxQty: Infinity, unitPrice: 800, setupCost: 22000 }
  ]
};