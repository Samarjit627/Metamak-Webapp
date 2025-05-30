import debug from 'debug';
import { getMaterialOption } from '../data/materials';

// Initialize debug logger
const logger = debug('app:costEstimator');

export interface CostEstimateInput {
  volume: number; // in cm³
  surfaceArea?: number; // in cm²
  quantity: number;
  materialType: string;
  complexity?: number; // 0–1
  setupCost?: number;
  materialSubtype?: string;
  materialGrade?: string;
}

export interface CostEstimateOutput {
  costPerUnit: number;
  setupCost: number;
  breakdown: {
    materialCost: number;
    finishingCost: number;
    complexityMultiplier: number;
    perUnitTooling: number;
  };
}

// Material rates map for Indian market (₹/cm³)
// Deprecated: getMaterialRate is no longer used
// function getMaterialRate(materialType: string): number {
//   const rates: Record<string, number> = {
//     plastic: 1.2,  // ₹1.2/cm³ for standard plastics
//     metal: 2.8,    // ₹2.8/cm³ for common metals
//     rubber: 1.5,   // ₹1.5/cm³ for rubber compounds
//     wood: 0.9      // ₹0.9/cm³ for wood materials
//   };
//   return rates[materialType.toLowerCase()] || 1.5;
// }

export function estimateCost(input: CostEstimateInput): CostEstimateOutput {
  try {
    logger('Estimating cost for:', input);

    const {
      volume,
      surfaceArea = 0,
      quantity,
      materialType,
      complexity = 0.3,
      setupCost = 20000,
      materialSubtype = '',
      materialGrade = ''
    } = input;

    // Fetch material option and grade
    const materialOption = getMaterialOption(materialType, materialSubtype);
    // Default to first grade if not specified
    const gradeObj = materialOption?.grades?.find(g => g.grade === materialGrade) || materialOption?.grades?.[0];
    const pricePerKg = gradeObj?.pricePerKg || 100; // fallback
    const density = materialOption?.properties?.density || 1.0; // g/cm³, fallback 1.0

    // Calculate mass in kg: volume (cm³) × density (g/cm³) / 1000
    const massKg = (volume * density) / 1000;
    // Calculate base material cost
    const materialCost = massKg * pricePerKg;
    const complexityMultiplier = 1 + complexity;
    const finishingCost = surfaceArea * 0.05; // ₹0.05/cm² surface finishing

    // Calculate total production cost including complexity
    const totalProductionCost = (materialCost + finishingCost) * quantity * complexityMultiplier;

    // Calculate tooling cost per unit
    const perUnitTooling = setupCost / Math.max(quantity, 1);

    // Calculate final costs
    const totalCost = totalProductionCost + setupCost;
    const costPerUnit = totalCost / quantity;

    logger('Cost estimation completed:', {
      costPerUnit,
      setupCost,
      breakdown: {
        materialCost,
        finishingCost,
        complexityMultiplier,
        perUnitTooling
      }
    });

    return {
      costPerUnit: Number(costPerUnit.toFixed(2)),
      setupCost,
      breakdown: {
        materialCost: Number(materialCost.toFixed(2)),
        finishingCost: Number(finishingCost.toFixed(2)),
        complexityMultiplier: Number(complexityMultiplier.toFixed(2)),
        perUnitTooling: Number(perUnitTooling.toFixed(2))
      }
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in cost estimation:', errorMsg);
    throw new Error(`Failed to estimate cost: ${errorMsg}`);
  }
}