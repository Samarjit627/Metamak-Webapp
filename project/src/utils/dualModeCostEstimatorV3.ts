import debug from 'debug';
import { processPricingMatrix } from './indianRatesConfig';

// Initialize debug logger
const logger = debug('app:costEstimatorV3');

export interface CostEstimatorInput {
  processKey: string;
  quantity: number;
  volumeCm3?: number;
  material?: string;
}

export interface CostEstimatorOutput {
  mode: 'Prototyping' | 'Bridge' | 'Production';
  basicCost: number;
  toolingCost?: number;
  setupCost?: number;
  totalCost: number;
  amortized: {
    toolingPerUnit: number;
    setupPerUnit: number;
    included: boolean;
  };
  recommendations: string[];
}

export function dualModeCostEstimatorV3(input: CostEstimatorInput): CostEstimatorOutput {
  try {
    logger('Processing cost estimation for:', input);

    const { processKey, quantity, volumeCm3 = 100, material = 'standard' } = input;
    const brackets = processPricingMatrix[processKey];

    if (!brackets) {
      throw new Error(`No pricing found for process: ${processKey}`);
    }

    // Select appropriate bracket
    const bracket = brackets.find(b => quantity >= b.minQty && quantity <= b.maxQty)
      || brackets[brackets.length - 1]; // fallback to highest bracket

    // Calculate base unit price with volume adjustment
    const volumeFactor = volumeCm3 > 100 ? Math.pow(volumeCm3 / 100, 0.7) : 1;
    const baseUnitPrice = bracket.unitPrice * volumeFactor;

    // Apply material factor
    const materialFactor = getMaterialFactor(material);
    const adjustedUnitPrice = baseUnitPrice * materialFactor;

    // Calculate tooling and setup costs
    const toolingCost = bracket.toolingCost || 0;
    const setupCost = bracket.setupCost || 0;

    // Calculate amortized costs
    const amortizedTooling = toolingCost / quantity;
    const amortizedSetup = setupCost / quantity;

    // Determine production mode
    let mode: CostEstimatorOutput['mode'] = "Production";
    if (quantity < 100) {
      mode = "Prototyping";
    } else if (quantity < 1000) {
      mode = "Bridge";
    }

    // Generate recommendations
    const recommendations = generateRecommendations(mode, processKey, quantity);

    // Calculate total cost
    const totalCost = adjustedUnitPrice + amortizedTooling + amortizedSetup;

    logger('Cost estimation completed successfully');

    return {
      mode,
      basicCost: adjustedUnitPrice,
      toolingCost,
      setupCost,
      totalCost,
      amortized: {
        toolingPerUnit: amortizedTooling,
        setupPerUnit: amortizedSetup,
        included: true
      },
      recommendations
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in cost estimation:', errorMsg);
    throw new Error(`Failed to estimate cost: ${errorMsg}`);
  }
}

function getMaterialFactor(material: string): number {
  const materialFactors: Record<string, number> = {
    'metal': 1.2,
    'aluminum': 1.1,
    'plastic': 1.0,
    'abs': 0.9,
    'pla': 0.8,
    'rubber': 1.1,
    'standard': 1.0
  };

  return materialFactors[material.toLowerCase()] || 1.0;
}

function generateRecommendations(
  mode: CostEstimatorOutput['mode'],
  processKey: string,
  quantity: number
): string[] {
  const recommendations: string[] = [];

  switch (mode) {
    case "Prototyping":
      recommendations.push("Consider rapid prototyping methods for faster iteration");
      recommendations.push("Focus on validating design before scaling production");
      if (processKey.includes('injection') || processKey.includes('die')) {
        recommendations.push("Consider 3D printing or CNC for low volumes");
      }
      break;

    case "Bridge":
      recommendations.push("Balance tooling investment with production volume");
      recommendations.push("Consider soft tooling options for flexibility");
      if (quantity > 500) {
        recommendations.push("Evaluate transition to production tooling");
      }
      break;

    case "Production":
      recommendations.push("Optimize tooling for high-volume efficiency");
      if (quantity > 10000) {
        recommendations.push("Consider multi-cavity tooling");
        recommendations.push("Evaluate automation opportunities");
      }
      break;
  }

  // Process-specific recommendations
  if (processKey.includes('cnc')) {
    recommendations.push("Optimize fixture design for batch processing");
  }

  return recommendations;
}