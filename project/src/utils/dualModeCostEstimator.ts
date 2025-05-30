import debug from 'debug';

// Initialize debug logger
const logger = debug('app:dualCostEstimator');

export interface DualModeCostEstimateInput {
  volume: number;             // in cm³
  surfaceArea: number;        // in cm²
  materialType: string;
  quantity: number;
  wallThickness?: number;     // optional, in mm
  processType?: string;       // optional, defaults to 'injection_molding'
}

export interface DualModeCostEstimateOutput {
  nonAmortized: {
    costPerUnit: number;
    materialCost: number;
    finishingCost: number;
  };
  amortized: {
    costPerUnit: number;
    materialCost: number;
    finishingCost: number;
    toolingPerUnit: number;
    setupPerUnit: number;
  };
}

const materialDensity: Record<string, number> = {
  metal: 7.85,     // Steel density
  aluminum: 2.7,
  plastic: 1.04,   // ABS density
  abs: 1.04,
  pp: 0.91,
  rubber: 0.95,
  wood: 0.7,
  nylon: 1.15
};

const materialRates: Record<string, number> = {
  metal: 250,      // Steel rate
  aluminum: 310,
  plastic: 125,    // ABS rate
  abs: 125,
  pp: 110,
  rubber: 180,
  wood: 90,
  nylon: 140
};

const finishingRatePerCm2 = 0.08; // glossy finish (VDI21)
const toolingCost = 100000; // Rs
const setupCost = 15000; // Rs
const wasteBufferFactor = 1.15; // 15% extra

export function dualModeCostEstimator(input: DualModeCostEstimateInput): DualModeCostEstimateOutput {
  try {
    logger('Calculating dual-mode cost estimate for:', input);

    const {
      volume,
      surfaceArea,
      materialType,
      quantity,
      wallThickness,
      processType = "injection_molding"
    } = input;

    const materialKey = materialType.toLowerCase();
    const density = materialDensity[materialKey] || 1.1; // default fallback
    const ratePerKg = materialRates[materialKey] || 130;

    const bufferedVolume = volume * wasteBufferFactor;
    const weightInGrams = bufferedVolume * density;
    const weightInKg = weightInGrams / 1000;

    const materialCost = weightInKg * ratePerKg;
    const finishingCost = surfaceArea * finishingRatePerCm2;

    // Apply complexity factor based on wall thickness if provided
    let complexityFactor = 1.0;
    if (wallThickness && wallThickness < 2.0) {
      complexityFactor = 1.2; // 20% increase for thin walls
    }

    const adjustedMaterialCost = materialCost * complexityFactor;
    const adjustedFinishingCost = finishingCost * complexityFactor;

    const toolingPerUnit = toolingCost / Math.max(quantity, 1000); // Minimum amortization over 1000 units
    const setupPerUnit = setupCost / quantity;

    const nonAmortizedCost = adjustedMaterialCost + adjustedFinishingCost;
    const amortizedCost = nonAmortizedCost + toolingPerUnit + setupPerUnit;

    logger('Cost estimate calculated successfully');

    return {
      nonAmortized: {
        costPerUnit: Number(nonAmortizedCost.toFixed(2)),
        materialCost: Number(adjustedMaterialCost.toFixed(2)),
        finishingCost: Number(adjustedFinishingCost.toFixed(2))
      },
      amortized: {
        costPerUnit: Number(amortizedCost.toFixed(2)),
        materialCost: Number(adjustedMaterialCost.toFixed(2)),
        finishingCost: Number(adjustedFinishingCost.toFixed(2)),
        toolingPerUnit: Number(toolingPerUnit.toFixed(2)),
        setupPerUnit: Number(setupPerUnit.toFixed(2))
      }
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error calculating cost estimate:', errorMsg);
    throw new Error(`Failed to calculate cost estimate: ${errorMsg}`);
  }
}