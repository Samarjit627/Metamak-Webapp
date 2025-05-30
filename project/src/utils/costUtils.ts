// Realistic cost calculation for Indian manufacturing market
interface CostCalculationInput {
  material: string;
  materialSubtype: string;
  materialGrade: string;
  volume: number; // in cm³
  complexity: number; // 0 to 1
  quantity: number;
}

interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  toolingCost: number;
  setupCost: number;
  overheadCost: number;
  totalUnitCost: number;
  totalBatchCost: number;
}

// Material base costs (₹/kg) for Indian market
const MATERIAL_BASE_COSTS = {
  metal: {
    aluminum: 180,    // ₹/kg
    steel: 65,        // ₹/kg
    stainless: 220,   // ₹/kg
    titanium: 800     // ₹/kg
  },
  plastic: {
    abs: 160,         // ₹/kg
    pla: 110,         // ₹/kg
    pc: 220,         // ₹/kg
    nylon: 180       // ₹/kg
  },
  rubber: {
    natural: 150,     // ₹/kg
    synthetic: 180    // ₹/kg
  },
  wood: {
    teak: 3200,      // ₹/kg
    pine: 60         // ₹/kg
  }
};

// Material densities (g/cm³)
const MATERIAL_DENSITIES = {
  metal: {
    aluminum: 2.7,    // g/cm³
    steel: 7.85,      // g/cm³
    stainless: 8.0,   // g/cm³
    titanium: 4.5     // g/cm³
  },
  plastic: {
    abs: 1.04,        // g/cm³
    pla: 1.25,        // g/cm³
    pc: 1.2,         // g/cm³
    nylon: 1.15      // g/cm³
  },
  rubber: {
    natural: 0.93,    // g/cm³
    synthetic: 0.95   // g/cm³
  },
  wood: {
    teak: 0.63,      // g/cm³
    pine: 0.42       // g/cm³
  }
};

// Base tooling costs (₹)
const TOOLING_BASE_COSTS = {
  metal: {
    machining: 50000,     // ₹
    casting: 150000,      // ₹
    forging: 200000       // ₹
  },
  plastic: {
    injection: 80000,     // ₹
    vacuum: 40000,        // ₹
    rotational: 100000    // ₹
  },
  rubber: {
    compression: 60000,   // ₹
    injection: 90000      // ₹
  },
  wood: {
    cnc: 30000,          // ₹
    manual: 15000        // ₹
  }
};

// Labor rates (₹/hour)
const LABOR_RATES = {
  skilled: 450,      // ₹/hour
  semiskilled: 350,  // ₹/hour
  unskilled: 250     // ₹/hour
};

// Setup costs (₹/batch)
const SETUP_COSTS = {
  metal: {
    machining: 5000,     // ₹/batch
    casting: 8000,       // ₹/batch
    forging: 10000       // ₹/batch
  },
  plastic: {
    injection: 4000,     // ₹/batch
    vacuum: 2000,        // ₹/batch
    rotational: 6000     // ₹/batch
  },
  rubber: {
    compression: 3000,   // ₹/batch
    injection: 4500      // ₹/batch
  },
  wood: {
    cnc: 2000,          // ₹/batch
    manual: 1000        // ₹/batch
  }
};

// Calculate quantity-based discount
function calculateQuantityDiscount(quantity: number): number {
  if (quantity >= 10000) return 0.80;      // 20% discount
  if (quantity >= 5000) return 0.85;       // 15% discount
  if (quantity >= 1000) return 0.90;       // 10% discount
  if (quantity >= 500) return 0.95;        // 5% discount
  return 1.0;                              // No discount
}

// Calculate complexity factor (capped at 0.7 * 0.4 = 28% increase)
function calculateComplexityFactor(complexity: number): number {
  return 1 + Math.min(complexity, 0.7) * 0.4;
}

export function calculateManufacturingCosts(input: CostCalculationInput): CostBreakdown {
  const {
    material,
    materialSubtype,
    materialGrade,
    volume,
    complexity,
    quantity
  } = input;

  // Get material cost per kg
  const materialCostPerKg = MATERIAL_BASE_COSTS[material as keyof typeof MATERIAL_BASE_COSTS]?.[materialSubtype as any] || 100;
  
  // Get material density
  const density = MATERIAL_DENSITIES[material as keyof typeof MATERIAL_DENSITIES]?.[materialSubtype as any] || 1.0;
  
  // Calculate weight in kg
  const weight = (volume * density) / 1000;
  
  // Calculate base material cost with quantity discount
  const quantityDiscount = calculateQuantityDiscount(quantity);
  const rawMaterialCost = weight * materialCostPerKg * quantityDiscount;
  
  // Calculate complexity factor (capped)
  const complexityFactor = calculateComplexityFactor(complexity);
  
  // Calculate labor cost based on complexity
  const laborHours = 0.015 * complexityFactor; // 54 seconds base time
  const laborCost = laborHours * LABOR_RATES.skilled;
  
  // Get tooling cost and amortize over quantity
  const toolingCostBase = TOOLING_BASE_COSTS[material as keyof typeof TOOLING_BASE_COSTS]?.['machining'] || 50000;
  const toolingCostPerUnit = (toolingCostBase * complexityFactor) / Math.max(quantity, getMinimumQuantity(material));
  
  // Get setup cost and amortize over quantity
  const setupCostBase = SETUP_COSTS[material as keyof typeof SETUP_COSTS]?.['machining'] || 3000;
  const setupCostPerUnit = setupCostBase / quantity;
  
  // Calculate overhead (energy, maintenance, etc.)
  const overheadRate = 0.15; // 15% overhead
  const overheadCost = (rawMaterialCost + laborCost) * overheadRate;
  
  // Calculate total unit cost
  const totalUnitCost = rawMaterialCost + laborCost + toolingCostPerUnit + setupCostPerUnit + overheadCost;

  return {
    materialCost: rawMaterialCost,
    laborCost: laborCost,
    toolingCost: toolingCostPerUnit,
    setupCost: setupCostPerUnit,
    overheadCost: overheadCost,
    totalUnitCost: totalUnitCost,
    totalBatchCost: totalUnitCost * quantity
  };
}

function getMinimumQuantity(material: string): number {
  switch (material.toLowerCase()) {
    case 'metal':
      return 100;
    case 'plastic':
      return 1000;
    case 'rubber':
      return 500;
    default:
      return 100;
  }
}

// Grade-specific cost adjustments
export function applyGradeAdjustment(cost: number, grade: string): number {
  const gradeFactors: Record<string, number> = {
    'Medical': 1.5,    // 50% premium for medical grade
    'Food': 1.3,       // 30% premium for food grade
    'Industrial': 1.0, // Standard industrial grade
    'Standard': 1.0    // Standard grade
  };

  const factor = gradeFactors[grade] || 1.0;
  return cost * factor;
}

// Location-based cost adjustments
export function applyLocationAdjustment(cost: number, location: string): number {
  const locationFactors: Record<string, number> = {
    'Mumbai': 1.25,    // 25% premium for Mumbai
    'Delhi': 1.15,     // 15% premium for Delhi
    'Bangalore': 1.2,  // 20% premium for Bangalore
    'Pune': 1.1,       // 10% premium for Pune
    'Chennai': 1.05,   // 5% premium for Chennai
    'Ahmedabad': 0.95, // 5% discount for Ahmedabad
    'Coimbatore': 0.9  // 10% discount for Coimbatore
  };

  const factor = locationFactors[location] || 1.0;
  return cost * factor;
}