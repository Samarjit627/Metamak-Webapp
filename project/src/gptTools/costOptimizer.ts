import { logger } from '../utils/chatAnalysis';

interface CostOptimizerInput {
  material: string;
  materialGrade?: string;
  process: string;
  volume: number; // cm³
  quantity: number;
  complexity: number; // 0–1
  tolerance: string;
  region: string;
}

interface CostOptimization {
  currentCosts: {
    unitCost: number;
    totalCost: number;
    labor: number;
    machine: number;
    material: number;
    setup: number;
    tooling: number;
  };
  optimizedCosts: {
    unitCost: number;
    totalCost: number;
  };
  suggestions: string[];
  potentialSavings: number;
}

// Indian market base rates (2025)
const BASE_RATES = {
  labor: {
    skilled: 450,    // ₹/hour
    unskilled: 250   // ₹/hour
  },
  machine: {
    cnc: 1200,       // ₹/hour
    injection: 800,  // ₹/hour
    assembly: 300    // ₹/hour
  },
  tooling: {
    simple: 80000,   // ₹
    medium: 150000,  // ₹
    complex: 250000  // ₹
  },
  setup: {
    minimum: 500,    // ₹
    standard: 2000,  // ₹
    complex: 5000    // ₹
  },
  regionMultiplier: {
    india: 0.75,
    default: 1.0
  }
};

export function costOptimizer(input: CostOptimizerInput): CostOptimization {
  try {
    logger('GPT Cost Optimizer running with input:', input);

    const {
      material,
      materialGrade,
      process,
      volume,
      quantity,
      complexity,
      region
    } = input;

    const regionKey = region.toLowerCase().includes("india") ? "india" : "default";
    const regionMultiplier = BASE_RATES.regionMultiplier[regionKey];

    // ✅ Tooling tier selection
    const toolingCostTotal =
      complexity > 0.7 ? BASE_RATES.tooling.complex :
      complexity > 0.3 ? BASE_RATES.tooling.medium :
      BASE_RATES.tooling.simple;

    const unitToolingCost = toolingCostTotal / Math.max(quantity, 1000);

    // ✅ Setup cost scaling
    const setupCostTotal =
      complexity > 0.7 ? BASE_RATES.setup.complex :
      BASE_RATES.setup.standard;

    const unitSetupCost = setupCostTotal / Math.max(quantity, 1000);

    // ✅ Smarter processing time
    const processingTimeHr = Math.max(0.008 + (volume / 10000) * (0.5 + complexity * 0.5), 0.005); // 30s–3min range

    const machineRate =
      process.toLowerCase().includes("cnc") ? BASE_RATES.machine.cnc :
      process.toLowerCase().includes("injection") ? BASE_RATES.machine.injection :
      BASE_RATES.machine.compression;

    const machineCost = processingTimeHr * machineRate * regionMultiplier;

    // ✅ Labor cost with capped complexity multiplier
    const complexityFactor = 1 + Math.min(complexity, 0.7) * 0.4;
    const laborCost = processingTimeHr * BASE_RATES.labor.skilled * complexityFactor * regionMultiplier;

    // ✅ Material cost with discount
    const baseRatePerCm3 = 0.20; // assume ₹/cm³
    const materialDiscount =
      quantity >= 100000 ? 0.6 :
      quantity >= 10000 ? 0.75 :
      quantity >= 1000 ? 0.85 :
      1.0;

    const materialCost = volume * baseRatePerCm3 * materialDiscount * regionMultiplier;

    const unitCost = laborCost + machineCost + materialCost + unitSetupCost + unitToolingCost;
    const totalCost = unitCost * quantity;

    // ⚡ Optimization ideas
    const optimizedUnitCost = unitCost * 0.85; // assume post-optimization via automation or design tweak
    const savings = (unitCost - optimizedUnitCost) * quantity;

    return {
      currentCosts: {
        labor: parseFloat(laborCost.toFixed(2)),
        machine: parseFloat(machineCost.toFixed(2)),
        material: parseFloat(materialCost.toFixed(2)),
        setup: parseFloat(unitSetupCost.toFixed(2)),
        tooling: parseFloat(unitToolingCost.toFixed(2)),
        unitCost: parseFloat(unitCost.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2))
      },
      optimizedCosts: {
        unitCost: parseFloat(optimizedUnitCost.toFixed(2)),
        totalCost: parseFloat((optimizedUnitCost * quantity).toFixed(2))
      },
      suggestions: [
        "Switch to higher-volume process (e.g. Injection Molding)",
        "Reduce material by optimizing wall thickness",
        "Explore automation to reduce labor cost"
      ],
      potentialSavings: parseFloat(savings.toFixed(2))
    };
  } catch (e) {
    console.error("GPT Cost Optimizer Error:", e);
    return {
      currentCosts: {
        labor: 0,
        machine: 0,
        material: 0,
        setup: 0,
        tooling: 0,
        unitCost: 0,
        totalCost: 0
      },
      optimizedCosts: {
        unitCost: 0,
        totalCost: 0
      },
      suggestions: [],
      potentialSavings: 0
    };
  }
}