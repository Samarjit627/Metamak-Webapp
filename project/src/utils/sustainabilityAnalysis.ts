import { BufferGeometry } from 'three';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:sustainabilityAnalysis');

interface SustainabilityMetrics {
  materialEfficiency: number;
  energyScore: number;
  carbonFootprint: number;
  recyclability: number;
  wasteReduction: string[];
}

export function analyzeSustainability(
  process: string,
  material: string,
  volume: number,
  quantity: number
): SustainabilityMetrics {
  logger('Analyzing sustainability:', { process, material, volume, quantity });

  try {
    // Calculate material efficiency
    const materialEfficiency = calculateMaterialEfficiency(process, volume);
    logger('Material efficiency calculated:', materialEfficiency);

    // Calculate energy score
    const energyScore = calculateEnergyScore(process, material, quantity);
    logger('Energy score calculated:', energyScore);

    // Calculate carbon footprint
    const carbonFootprint = calculateCarbonFootprint(process, material, volume, quantity);
    logger('Carbon footprint calculated:', carbonFootprint);

    // Calculate recyclability
    const recyclability = calculateRecyclability(material);
    logger('Recyclability calculated:', recyclability);

    // Generate waste reduction strategies
    const wasteReduction = generateWasteReductionStrategies(process, material);
    logger('Waste reduction strategies generated:', wasteReduction);

    return {
      materialEfficiency,
      energyScore,
      carbonFootprint,
      recyclability,
      wasteReduction
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in sustainability analysis:', errorMsg);
    console.error('Error in sustainability analysis:', error);

    // Return default metrics in case of error
    return {
      materialEfficiency: 0.7,
      energyScore: 0.6,
      carbonFootprint: 100,
      recyclability: 0.5,
      wasteReduction: [
        'Implement standard material recycling practices',
        'Follow general waste reduction guidelines',
        'Consider eco-friendly material alternatives'
      ]
    };
  }
}

function calculateMaterialEfficiency(process: string, volume: number): number {
  const baseEfficiency = getBaseEfficiency(process);
  const volumeFactor = Math.min(1, Math.max(0.5, 1 - (volume / 1000)));
  return baseEfficiency * volumeFactor;
}

function calculateEnergyScore(process: string, material: string, quantity: number): number {
  const baseEnergy = getBaseEnergyConsumption(process);
  const materialFactor = getMaterialEnergyFactor(material);
  const quantityFactor = Math.min(1, Math.max(0.6, 1 - (Math.log10(quantity) / 10)));
  
  return 1 - ((baseEnergy * materialFactor * quantityFactor) / 100);
}

function calculateCarbonFootprint(
  process: string,
  material: string,
  volume: number,
  quantity: number
): number {
  const baseCarbonPerUnit = getBaseCarbonEmission(process, material);
  const volumeFactor = volume / 100;
  return baseCarbonPerUnit * volumeFactor * quantity;
}

function calculateRecyclability(material: string): number {
  switch (material.toLowerCase()) {
    case 'metal':
      return 0.9;
    case 'plastic':
      return 0.6;
    case 'rubber':
      return 0.4;
    case 'wood':
      return 0.8;
    default:
      return 0.5;
  }
}

function generateWasteReductionStrategies(process: string, material: string): string[] {
  const strategies: string[] = [];

  // Process-specific strategies
  switch (process.toLowerCase()) {
    case 'cnc machining':
      strategies.push('Optimize tool paths to minimize material waste');
      strategies.push('Implement chip recycling program');
      strategies.push('Use minimum quantity lubrication (MQL)');
      break;
    case 'injection molding':
      strategies.push('Optimize gate and runner design');
      strategies.push('Implement sprue and runner recycling');
      strategies.push('Minimize purging waste');
      break;
    case '3d printing':
      strategies.push('Optimize part orientation for minimal support');
      strategies.push('Use infill optimization techniques');
      strategies.push('Recycle failed prints and support material');
      break;
    default:
      strategies.push('Implement standard material recycling');
      strategies.push('Optimize process parameters');
  }

  // Material-specific strategies
  switch (material.toLowerCase()) {
    case 'metal':
      strategies.push('Implement metal scrap sorting and recycling');
      strategies.push('Use optimized cutting parameters');
      break;
    case 'plastic':
      strategies.push('Separate and recycle different plastic types');
      strategies.push('Minimize material degradation during processing');
      break;
    case 'rubber':
      strategies.push('Optimize mold design to minimize flash');
      strategies.push('Implement rubber recycling program');
      break;
    case 'wood':
      strategies.push('Use wood waste for other applications');
      strategies.push('Implement dust collection and reuse');
      break;
  }

  return strategies;
}

function getBaseEfficiency(process: string): number {
  switch (process.toLowerCase()) {
    case 'cnc machining':
      return 0.65;
    case 'injection molding':
      return 0.85;
    case '3d printing':
      return 0.90;
    case 'casting':
      return 0.75;
    default:
      return 0.70;
  }
}

function getBaseEnergyConsumption(process: string): number {
  switch (process.toLowerCase()) {
    case 'cnc machining':
      return 75;
    case 'injection molding':
      return 60;
    case '3d printing':
      return 40;
    case 'casting':
      return 85;
    default:
      return 65;
  }
}

function getMaterialEnergyFactor(material: string): number {
  switch (material.toLowerCase()) {
    case 'metal':
      return 1.2;
    case 'plastic':
      return 0.8;
    case 'rubber':
      return 0.9;
    case 'wood':
      return 0.6;
    default:
      return 1.0;
  }
}

function getBaseCarbonEmission(process: string, material: string): number {
  let baseEmission = 0;

  // Process-based emissions
  switch (process.toLowerCase()) {
    case 'cnc machining':
      baseEmission = 5.0;
      break;
    case 'injection molding':
      baseEmission = 3.5;
      break;
    case '3d printing':
      baseEmission = 2.0;
      break;
    default:
      baseEmission = 3.0;
  }

  // Material factor
  const materialFactor = {
    metal: 1.5,
    plastic: 1.2,
    rubber: 1.1,
    wood: 0.8
  }[material.toLowerCase()] || 1.0;

  return baseEmission * materialFactor;
}