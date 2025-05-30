import { logger } from '../utils/chatAnalysis';

interface ToolingEstimateInput {
  material: string;
  materialSubtype: string;
  materialGrade: string;
  quantity: number;
  complexity: number;
  tolerance?: string;
  region?: string;
}

interface ToolingEstimate {
  content: string;
  costs: {
    design: number;
    fabrication: number;
    testing: number;
    total: number;
    amortized: number;
  };
  timeline: {
    design: number;
    fabrication: number;
    testing: number;
    total: number;
  };
}

// Indian market tooling cost benchmarks (2025)
const TOOLING_BENCHMARKS = {
  'Injection Molding': {
    baseCost: {
      simple: 80000,    // INR
      medium: 150000,
      complex: 250000
    },
    designTime: {
      simple: 5,        // days
      medium: 10,
      complex: 15
    },
    fabricationTime: {
      simple: 15,
      medium: 25,
      complex: 35
    }
  },
  'Die Casting': {
    baseCost: {
      simple: 150000,
      medium: 250000,
      complex: 400000
    },
    designTime: {
      simple: 7,
      medium: 12,
      complex: 18
    },
    fabricationTime: {
      simple: 20,
      medium: 30,
      complex: 45
    }
  }
};

export function estimateTooling(input: ToolingEstimateInput): ToolingEstimate {
  try {
    logger('Estimating tooling costs for:', input);

    const {
      material,
      materialSubtype,
      materialGrade,
      quantity,
      complexity,
      tolerance = '±0.1',
      region = 'Ahmedabad'
    } = input;

    // Determine process based on material and quantity
    const process = determineProcess(material, quantity);
    
    // Get complexity category
    const complexityCategory = getComplexityCategory(complexity);
    
    // Calculate base costs
    const baseCosts = calculateBaseCosts(process, complexityCategory);
    
    // Apply regional factors
    const regionalCosts = applyRegionalFactors(baseCosts, region);
    
    // Calculate timeline
    const timeline = calculateTimeline(process, complexityCategory);
    
    // Format response
    const content = formatToolingEstimate(
      regionalCosts,
      timeline,
      input,
      process
    );

    return {
      content,
      costs: regionalCosts,
      timeline
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error estimating tooling:', errorMsg);
    throw new Error(`Failed to estimate tooling: ${errorMsg}`);
  }
}

function determineProcess(material: string, quantity: number): keyof typeof TOOLING_BENCHMARKS {
  if (material.toLowerCase() === 'metal' && quantity >= 5000) {
    return 'Die Casting';
  }
  return 'Injection Molding';
}

function getComplexityCategory(complexity: number): 'simple' | 'medium' | 'complex' {
  if (complexity < 0.4) return 'simple';
  if (complexity < 0.7) return 'medium';
  return 'complex';
}

function calculateBaseCosts(
  process: keyof typeof TOOLING_BENCHMARKS,
  complexity: 'simple' | 'medium' | 'complex'
) {
  const benchmarks = TOOLING_BENCHMARKS[process];
  const baseCost = benchmarks.baseCost[complexity];

  return {
    design: baseCost * 0.2,
    fabrication: baseCost * 0.7,
    testing: baseCost * 0.1,
    total: baseCost,
    amortized: baseCost
  };
}

function applyRegionalFactors(costs: any, region: string) {
  // Regional cost factors for major Indian manufacturing hubs
  const regionalFactors: Record<string, number> = {
    'Pune': 1.1,
    'Bangalore': 1.2,
    'Chennai': 1.05,
    'Ahmedabad': 0.95,
    'Delhi': 1.15
  };

  const factor = regionalFactors[region] || 1.0;
  
  return {
    design: costs.design * factor,
    fabrication: costs.fabrication * factor,
    testing: costs.testing * factor,
    total: costs.total * factor,
    amortized: costs.amortized * factor
  };
}

function calculateTimeline(
  process: keyof typeof TOOLING_BENCHMARKS,
  complexity: 'simple' | 'medium' | 'complex'
) {
  const benchmarks = TOOLING_BENCHMARKS[process];
  
  return {
    design: benchmarks.designTime[complexity],
    fabrication: benchmarks.fabricationTime[complexity],
    testing: Math.ceil(benchmarks.fabricationTime[complexity] * 0.2),
    total: benchmarks.designTime[complexity] + 
           benchmarks.fabricationTime[complexity] + 
           Math.ceil(benchmarks.fabricationTime[complexity] * 0.2)
  };
}

function formatToolingEstimate(
  costs: any,
  timeline: any,
  input: ToolingEstimateInput,
  process: string
): string {
  return `🛠️ Tooling Cost Estimation (${process})

Production Context:
• Material: ${input.material} ${input.materialSubtype ? `(${input.materialSubtype})` : ''}
• Grade: ${input.materialGrade || 'Standard'}
• Quantity: ${input.quantity.toLocaleString()} units
• Manufacturing Hub: ${input.region || 'Not specified'}

Estimated Costs:
• Design & Engineering: ₹${costs.design.toLocaleString()}
• Tool Fabrication: ₹${costs.fabrication.toLocaleString()}
• Testing & Validation: ₹${costs.testing.toLocaleString()}
• Total Tooling Cost: ₹${costs.total.toLocaleString()}
• Cost Per Part: ₹${(costs.amortized / input.quantity).toFixed(2)}

Timeline:
• Design Phase: ${timeline.design} days
• Fabrication: ${timeline.fabrication} days
• Testing: ${timeline.testing} days
• Total Lead Time: ${timeline.total} days

Would you like to explore cost optimization opportunities or discuss alternative tooling approaches?`;
}