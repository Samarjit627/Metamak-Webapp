import { Vector3 } from 'three';
import { ToolingCost, ToolingDetails, ManufacturingLocation } from '../types/manufacturing';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:toolingAnalysis');

export function analyzeTooling(
  process: string,
  partVolume: number,
  complexity: number,
  quantity: number,
  location: ManufacturingLocation
): ToolingDetails | null {
  logger('Analyzing tooling for:', { process, partVolume, complexity, quantity });

  if (!requiresTooling(process)) {
    logger('No tooling required for process:', process);
    return null;
  }

  try {
    const costs = calculateToolingCosts(process, partVolume, complexity, quantity, location);
    const dimensions = estimateToolDimensions(partVolume);
    
    const tooling: ToolingDetails = {
      type: getToolingType(process),
      complexity,
      estimatedLife: estimateToolLife(process, complexity),
      maintenanceInterval: estimateMaintenanceInterval(process, complexity),
      specifications: {
        dimensions,
        material: getToolMaterial(process),
        surfaceFinish: getRequiredSurfaceFinish(process),
        tolerance: getRequiredTolerance(process)
      },
      costs
    };

    logger('Tooling analysis completed:', tooling);
    return tooling;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error analyzing tooling:', errorMsg);
    console.error('Error analyzing tooling:', error);
    return null;
  }
}

function calculateToolingCosts(
  process: string,
  partVolume: number,
  complexity: number,
  quantity: number,
  location: ManufacturingLocation
): ToolingCost {
  const baseSetupCost = getBaseSetupCost(process);
  const baseMaterialCost = getBaseMaterialCost(process, partVolume);
  const baseLabor = getBaseLabor(process, complexity);
  
  // Apply location-specific factors
  const setupCost = baseSetupCost * location.costIndex;
  const materialCost = baseMaterialCost * location.costIndex;
  const laborCost = baseLabor * (location.laborRate / 400); // Normalized to average labor rate
  
  // Calculate maintenance based on complexity and volume
  const maintenanceCost = (setupCost + materialCost) * 0.15 * complexity;
  
  const total = setupCost + materialCost + laborCost + maintenanceCost;
  const amortization = calculateAmortization(total, quantity, process);
  
  return {
    setup: setupCost,
    materials: materialCost,
    labor: laborCost,
    maintenance: maintenanceCost,
    total,
    amortization,
    costPerPart: amortization / quantity
  };
}

function getBaseSetupCost(process: string): number {
  switch (process) {
    case 'Injection Molding':
      return 8000;
    case 'Die Casting':
      return 15000;
    case 'Sheet Metal Stamping':
      return 5000;
    case 'Forging':
      return 12000;
    default:
      return 0;
  }
}

function getBaseMaterialCost(process: string, volume: number): number {
  const volumeFactor = Math.pow(volume, 1/3); // Cube root for more realistic scaling
  switch (process) {
    case 'Injection Molding':
      return 2000 * volumeFactor;
    case 'Die Casting':
      return 4000 * volumeFactor;
    case 'Sheet Metal Stamping':
      return 1500 * volumeFactor;
    case 'Forging':
      return 3000 * volumeFactor;
    default:
      return 0;
  }
}

function getBaseLabor(process: string, complexity: number): number {
  const complexityFactor = 1 + complexity;
  switch (process) {
    case 'Injection Molding':
      return 3000 * complexityFactor;
    case 'Die Casting':
      return 4500 * complexityFactor;
    case 'Sheet Metal Stamping':
      return 2000 * complexityFactor;
    case 'Forging':
      return 3500 * complexityFactor;
    default:
      return 0;
  }
}

function calculateAmortization(totalCost: number, quantity: number, process: string): number {
  const minQuantity = getMinimumQuantity(process);
  const effectiveQuantity = Math.max(quantity, minQuantity);
  return totalCost / effectiveQuantity;
}

function getMinimumQuantity(process: string): number {
  switch (process) {
    case 'Injection Molding':
      return 1000;
    case 'Die Casting':
      return 500;
    case 'Sheet Metal Stamping':
      return 300;
    case 'Forging':
      return 200;
    default:
      return 1;
  }
}

function requiresTooling(process: string): boolean {
  return [
    'Injection Molding',
    'Die Casting',
    'Sheet Metal Stamping',
    'Forging'
  ].includes(process);
}

function getToolingType(process: string): string {
  switch (process) {
    case 'Injection Molding':
      return 'Injection Mold';
    case 'Die Casting':
      return 'Die Cast Tool';
    case 'Sheet Metal Stamping':
      return 'Stamping Die';
    case 'Forging':
      return 'Forging Die';
    default:
      return 'Unknown';
  }
}

function estimateToolLife(process: string, complexity: number): number {
  const baseLife = {
    'Injection Molding': 100000,
    'Die Casting': 50000,
    'Sheet Metal Stamping': 200000,
    'Forging': 30000
  }[process] || 0;

  return Math.floor(baseLife * (1 - complexity * 0.3));
}

function estimateMaintenanceInterval(process: string, complexity: number): number {
  const baseInterval = {
    'Injection Molding': 10000,
    'Die Casting': 5000,
    'Sheet Metal Stamping': 20000,
    'Forging': 3000
  }[process] || 0;

  return Math.floor(baseInterval * (1 - complexity * 0.4));
}

function estimateToolDimensions(partVolume: number): Vector3 {
  const baseSize = Math.pow(partVolume, 1/3); // Cube root for approximate size
  const toolingAllowance = 1.5; // 50% larger than part
  
  return new Vector3(
    baseSize * toolingAllowance,
    baseSize * toolingAllowance,
    baseSize * toolingAllowance
  );
}

function getToolMaterial(process: string): string {
  switch (process) {
    case 'Injection Molding':
      return 'P20 Tool Steel';
    case 'Die Casting':
      return 'H13 Tool Steel';
    case 'Sheet Metal Stamping':
      return 'D2 Tool Steel';
    case 'Forging':
      return 'H13 Tool Steel';
    default:
      return 'Unknown';
  }
}

function getRequiredSurfaceFinish(process: string): string {
  switch (process) {
    case 'Injection Molding':
      return 'SPI-A2 (16-32 μin)';
    case 'Die Casting':
      return '125-250 μin';
    case 'Sheet Metal Stamping':
      return '32-63 μin';
    case 'Forging':
      return '250-500 μin';
    default:
      return 'Unknown';
  }
}

function getRequiredTolerance(process: string): string {
  switch (process) {
    case 'Injection Molding':
      return '±0.05mm';
    case 'Die Casting':
      return '±0.1mm';
    case 'Sheet Metal Stamping':
      return '±0.1mm';
    case 'Forging':
      return '±0.2mm';
    default:
      return 'Unknown';
  }
}