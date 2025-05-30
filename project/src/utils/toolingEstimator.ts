import { getPartContext } from './getPartContext';
import debug from 'debug';
import { baseToolingRates } from './indianRatesConfig';

// Initialize debug logger
const logger = debug('app:toolingEstimator');

interface ToolingEstimateInput {
  material: string;
  materialSubtype?: string;
  materialGrade?: string;
  process?: string;
  quantity: number;
  complexity?: "Low" | "Medium" | "High";
  partSize?: "Small" | "Medium" | "Large";
}

export interface ToolingEstimateBreakdown {
  process: string;
  baseCost: number;
  materialFactor: number;
  complexityFactor: number;
  sizeFactor: number;
  undercutFactor: number;
  quantity: number;
  finalToolingCost: number;
  numCavities: number | string;
  recommendations: string[];
  notes?: string[];
}

export async function estimateTooling(input: ToolingEstimateInput): Promise<ToolingEstimateBreakdown> {
  try {
    logger('Estimating tooling with input:', input);

    // Get part context from CAD analysis
    const partContext = getPartContext();
    logger('Retrieved part context:', partContext);

    // Determine process based on material and quantity if not provided
    const process = input.process || determineProcess(input.material, input.quantity);
    
    // Determine complexity from part context if not provided
    const complexity = input.complexity || 
      (partContext.complexity > 0.7 ? "High" : 
       partContext.complexity > 0.4 ? "Medium" : "Low");
    
    // Determine part size from volume if not provided
    const partSize = input.partSize || 
      (partContext.volume > 1000 ? "Large" : 
       partContext.volume > 100 ? "Medium" : "Small");

    // Adjusted multipliers
    const materialFactor = input.material.toLowerCase().includes("rubber") ? 1.2 : 1.0;
    const complexityFactor = complexity === "High" ? 1.4 : complexity === "Medium" ? 1.2 : 1.0;
    const sizeFactor = partSize === "Large" ? 1.3 : partSize === "Small" ? 0.8 : 1.0;

    // Determine if part has undercuts
    const undercutFactor = partContext.undercuts ? 1.25 : 1.0;

    // Find the closest process key in the base rates
    const cleanProcessKey = Object.keys(baseToolingRates).find(p =>
      process.toLowerCase().includes(p.toLowerCase())
    );

    let baseCost = cleanProcessKey ? baseToolingRates[cleanProcessKey as keyof typeof baseToolingRates] : 100000;

    // Apply all factors
    let finalToolingCost = baseCost * materialFactor * complexityFactor * sizeFactor * undercutFactor;

    // Volume-based adjustment
    if (input.quantity > 10000) {
      // For high volumes, consider multi-cavity tooling
      finalToolingCost *= 1.5; // Multi-cavity premium
    }

    // Fallback for unrealistic suggestions
    if (finalToolingCost < 20000 && process !== "3D Printing") {
      finalToolingCost = 50000 + Math.random() * 30000;
    }

    logger('Estimated tooling cost:', finalToolingCost);
    // --- Cavity Calculation ---
let numCavities: number | string = 1;
let recommendations: string[] = [];
if (process.toLowerCase().includes('injection')) {
  if (material.toLowerCase().includes('rubber')) {
    if (input.quantity > 10000) numCavities = 2;
    else numCavities = 1;
    recommendations.push("Limit cavities due to longer cure and flash risk in rubber.");
    if (input.quantity > 10000) recommendations.push("2-cavity mold possible for high volume rubber, but check cycle time.");
  } else { // Plastics and others
    if (input.quantity > 10000) numCavities = 4;
    else if (input.quantity > 1000) numCavities = 2;
    else numCavities = 1;
    if (input.quantity > 10000) recommendations.push("Multi-cavity (4+) recommended for high volume plastics.");
  }
  recommendations.push("Optimize runner and gate design for uniform filling.");
} else if (process.toLowerCase().includes('compression') || process.toLowerCase().includes('transfer')) {
  numCavities = (input.quantity > 15000 && partSize === 'Small') ? 2 : 1;
  recommendations.push("Compression/transfer molding: usually 1 cavity, 2 for very high volume small parts.");
} else if (process.toLowerCase().includes('die casting')) {
  numCavities = (input.quantity > 20000 && partSize === 'Small') ? 2 : 1;
  recommendations.push("Die casting: use 1 cavity, 2 only for very high volume small parts.");
  recommendations.push("Ensure draft angles for easy ejection.");
} else if (process.toLowerCase().includes('sheet metal')) {
  numCavities = 'N/A';
  recommendations.push("Sheet metal: not cavity-based, focus on tool wear and alignment.");
} else if (process.toLowerCase().includes('3d printing') || process.toLowerCase().includes('cnc')) {
  numCavities = 'N/A';
  recommendations.push("Not cavity-based process.");
}
if (partContext.undercuts) recommendations.push("Add lifters/slides for undercuts.");
if (complexity === 'High') recommendations.push("Simplify part to reduce mold cost and complexity.");
if (partSize === 'Large') recommendations.push("Check press/machine size for large mold base.");
if (input.quantity > 10000 && !material.toLowerCase().includes('rubber')) recommendations.push("Use hardened steel for long tool life in high volume.");
return {
  process,
  baseCost,
  materialFactor,
  complexityFactor,
  sizeFactor,
  undercutFactor,
  quantity: input.quantity,
  finalToolingCost: Math.round(finalToolingCost),
  numCavities,           // <-- Make sure this is included!
  recommendations,       // <-- Make sure this is included!
  notes: [
    `Process: ${process}`,
    `Complexity: ${complexity}`,
    `Part size: ${partSize}`,
    partContext.undercuts ? 'Has undercuts' : 'No undercuts'
  ]
};
  } catch (error) {
    logger('Error estimating tooling:', error);
    return {
      process: input.process || 'Unknown',
      baseCost: 100000,
      materialFactor: 1.0,
      complexityFactor: 1.0,
      sizeFactor: 1.0,
      undercutFactor: 1.0,
      quantity: input.quantity,
      finalToolingCost: 100000,
      notes: ['Fallback estimate']
    };
  }
}

function determineProcess(material: string, quantity: number): string {
  const m = (material || '').toLowerCase();
  
  if (m.includes('metal')) {
    return quantity > 5000 ? "Die Casting" : "CNC Machining";
  } else if (m.includes('plastic')) {
    return quantity > 1000 ? "Injection Molding" : 
           quantity > 100 ? "Vacuum Forming" : "3D Printing";
  } else if (m.includes('rubber')) {
    return "Compression Molding";
  } else {
    return "CNC Machining";
  }
}