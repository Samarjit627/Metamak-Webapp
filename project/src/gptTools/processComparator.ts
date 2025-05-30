import { logger } from '../utils/chatAnalysis';

interface ProcessComparatorInput {
  material: string;
  materialSubtype: string;
  materialGrade: string;
  quantity: number;
  volume: number;
  complexity: number;
  tolerance?: string;
  region?: string;
}

interface ProcessComparison {
  content: string;
  recommendations: {
    primary: string;
    alternatives: string[];
    reasons: string[];
  };
}

// Indian market process capabilities and constraints
const PROCESS_CAPABILITIES = {
  'CNC Machining': {
    minWallThickness: 0.8,  // mm
    maxSize: 1000,          // mm
    tolerances: 0.05,       // mm
    surfaceFinish: 1.6,     // Ra
    materials: ['metal', 'plastic', 'wood'],
    minQuantity: 1,
    maxQuantity: 1000,
    setupCost: 5000,        // INR
    costPerHour: 1200       // INR
  },
  'Injection Molding': {
    minWallThickness: 0.5,
    maxSize: 500,
    tolerances: 0.1,
    surfaceFinish: 0.8,
    materials: ['plastic', 'rubber'],
    minQuantity: 1000,
    maxQuantity: 1000000,
    setupCost: 80000,
    costPerHour: 800
  },
  'Die Casting': {
    minWallThickness: 1.0,
    maxSize: 800,
    tolerances: 0.1,
    surfaceFinish: 3.2,
    materials: ['metal'],
    minQuantity: 5000,
    maxQuantity: 500000,
    setupCost: 150000,
    costPerHour: 1500
  }
};

export function processComparator(input: ProcessComparatorInput): ProcessComparison {
  try {
    logger('Analyzing manufacturing processes for:', input);

    const {
      material,
      materialSubtype,
      materialGrade,
      quantity,
      volume,
      complexity,
      tolerance = '±0.1',
      region = 'Ahmedabad'
    } = input;

    // Filter suitable processes based on material and quantity
    const suitableProcesses = Object.entries(PROCESS_CAPABILITIES)
      .filter(([_, capabilities]) => {
        return capabilities.materials.includes(material.toLowerCase()) &&
               quantity >= capabilities.minQuantity &&
               quantity <= capabilities.maxQuantity;
      })
      .map(([process, capabilities]) => {
        const suitabilityScore = calculateSuitabilityScore(
          process,
          capabilities,
          input
        );
        return { process, capabilities, suitabilityScore };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    if (suitableProcesses.length === 0) {
      return {
        content: `No suitable manufacturing process found for ${material} with quantity ${quantity}. Consider:
        • Reviewing production quantity requirements
        • Exploring alternative materials
        • Breaking down into sub-components
        
        Would you like to discuss alternative approaches?`,
        recommendations: {
          primary: 'None',
          alternatives: [],
          reasons: ['No suitable process found for given requirements']
        }
      };
    }

    const primaryProcess = suitableProcesses[0];
    const alternatives = suitableProcesses.slice(1);

    const recommendations = {
      primary: primaryProcess.process,
      alternatives: alternatives.map(p => p.process),
      reasons: generateRecommendationReasons(primaryProcess, input)
    };

    const content = formatProcessComparison(
      primaryProcess,
      alternatives,
      input
    );

    return { content, recommendations };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in process comparison:', errorMsg);
    throw new Error(`Failed to compare processes: ${errorMsg}`);
  }
}

function calculateSuitabilityScore(
  process: string,
  capabilities: typeof PROCESS_CAPABILITIES[keyof typeof PROCESS_CAPABILITIES],
  input: ProcessComparatorInput
): number {
  let score = 1.0;

  // Quantity factor (0-1)
  const quantityFactor = Math.min(
    (input.quantity - capabilities.minQuantity) / 
    (capabilities.maxQuantity - capabilities.minQuantity),
    1
  );
  score *= (0.3 + quantityFactor * 0.7);

  // Complexity penalty
  if (input.complexity > 0.7) {
    score *= (1 - (input.complexity - 0.7));
  }

  // Tolerance factor
  const requiredTolerance = parseFloat(input.tolerance?.replace('±', '') || '0.1');
  if (requiredTolerance < capabilities.tolerances) {
    score *= 0.7;
  }

  return Math.max(0, Math.min(score, 1));
}

function generateRecommendationReasons(
  process: { process: string; capabilities: any; suitabilityScore: number },
  input: ProcessComparatorInput
): string[] {
  const reasons: string[] = [];

  // Quantity-based reasons
  if (input.quantity > 5000) {
    reasons.push(`Optimal for high volume production (${input.quantity} units)`);
  } else if (input.quantity < 100) {
    reasons.push('Suitable for low volume production');
  }

  // Complexity-based reasons
  if (input.complexity > 0.7) {
    reasons.push('Can handle complex geometries');
  }

  // Material-specific reasons
  if (input.material.toLowerCase() === 'metal') {
    reasons.push(`Good for ${input.materialGrade || 'standard'} ${input.materialSubtype || input.material}`);
  }

  // Cost-effectiveness
  if (process.suitabilityScore > 0.8) {
    reasons.push('Cost-effective for specified quantity');
  }

  return reasons;
}

function formatProcessComparison(
  primary: { process: string; capabilities: any; suitabilityScore: number },
  alternatives: { process: string; capabilities: any; suitabilityScore: number }[],
  input: ProcessComparatorInput
): string {
  return `🔍 Manufacturing Process Analysis

Input Parameters:
• Material: ${input.material} ${input.materialSubtype ? `(${input.materialSubtype})` : ''}
• Quantity: ${input.quantity} units
• Volume: ${input.volume.toFixed(1)} cm³
• Complexity: ${(input.complexity * 100).toFixed(0)}%
${input.tolerance ? `• Required Tolerance: ${input.tolerance}` : ''}
${input.region ? `• Manufacturing Region: ${input.region}` : ''}

Recommended Primary Process: ${primary.process}
Suitability Score: ${(primary.suitabilityScore * 100).toFixed(0)}%

Key Advantages:
${generateRecommendationReasons(primary, input).map(reason => `• ${reason}`).join('\n')}

Alternative Processes:
${alternatives.map(alt => 
  `• ${alt.process} (${(alt.suitabilityScore * 100).toFixed(0)}% suitable)`
).join('\n')}

Would you like more detailed information about any of these processes or their cost implications?`;
}