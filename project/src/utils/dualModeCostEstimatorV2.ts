import debug from 'debug';

// Initialize debug logger
const logger = debug('app:dualCostEstimatorV2');

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
  mode: 'prototype' | 'bridge' | 'production';
  recommendations: string[];
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
const baseToolingCost = 100000; // Rs
const baseSetupCost = 15000; // Rs
const wasteBufferFactor = 1.15; // 15% extra

export function dualModeCostEstimatorV2(input: DualModeCostEstimateInput): DualModeCostEstimateOutput {
  try {
    logger('Calculating dual-mode cost estimate V2 for:', input);

    const {
      volume,
      surfaceArea,
      materialType,
      quantity,
      wallThickness,
      processType = "injection_molding"
    } = input;

    // Determine production mode
    const mode = quantity <= 99 ? 'prototype' :
                quantity <= 999 ? 'bridge' : 'production';

    // Get base material costs
    const materialKey = materialType.toLowerCase();
    const density = materialDensity[materialKey] || 1.1;
    const ratePerKg = materialRates[materialKey] || 130;

    // Calculate material cost
    const bufferedVolume = volume * wasteBufferFactor;
    const weightInGrams = bufferedVolume * density;
    const weightInKg = weightInGrams / 1000;
    const materialCost = weightInKg * ratePerKg;

    // Calculate finishing cost
    const finishingCost = surfaceArea * finishingRatePerCm2;

    // Apply mode-specific adjustments
    let toolingCost = baseToolingCost;
    let setupCost = baseSetupCost;
    let recommendations: string[] = [];

    switch (mode) {
      case 'prototype':
        toolingCost *= 0.2; // Reduced tooling cost for prototypes
        setupCost *= 0.5;
        recommendations = [
          'Consider 3D printing or CNC machining',
          'Focus on iteration speed over cost',
          'Minimal tooling investment recommended'
        ];
        break;
      case 'bridge':
        toolingCost *= 0.6; // Medium tooling cost for bridge production
        setupCost *= 0.8;
        recommendations = [
          'Consider soft tooling options',
          'Balance cost vs. production speed',
          'Evaluate hybrid manufacturing approaches'
        ];
        break;
      case 'production':
        recommendations = [
          'Full tooling investment recommended',
          'Optimize for high-volume efficiency',
          'Consider automated production'
        ];
        break;
    }

    // Apply complexity factor based on wall thickness
    let complexityFactor = 1.0;
    if (wallThickness && wallThickness < 2.0) {
      complexityFactor = 1.2; // 20% increase for thin walls
    }

    const adjustedMaterialCost = materialCost * complexityFactor;
    const adjustedFinishingCost = finishingCost * complexityFactor;

    const toolingPerUnit = toolingCost / Math.max(quantity, 1000);
    const setupPerUnit = setupCost / quantity;

    const nonAmortizedCost = adjustedMaterialCost + adjustedFinishingCost;
    const amortizedCost = nonAmortizedCost + toolingPerUnit + setupPerUnit;

    logger('Cost estimate V2 calculated successfully');

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
      },
      mode,
      recommendations
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error calculating cost estimate V2:', errorMsg);
    throw new Error(`Failed to calculate cost estimate V2: ${errorMsg}`);
  }
}