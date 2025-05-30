import { ManufacturingPlanInput, ManufacturingPlanOutput } from '../types/manufacturing';
import { autoManufacturingPlanAgent } from '../agents/autoManufacturingPlanAgent';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:manufacturingPlan');

export async function generateManufacturingPlan(input: ManufacturingPlanInput): Promise<ManufacturingPlanOutput> {
  try {
    logger('Generating manufacturing plan for:', input);
    
    const { partName, geometry, material, quantity } = input;

    // Call the auto manufacturing plan agent
    logger('Calling auto manufacturing plan agent with:', {
      material: material?.type,
      subtype: material?.subtype,
      grade: material?.grade,
      quantity,
      geometry: {
        volume: geometry?.volume,
        complexity: geometry?.complexity
      }
    });

    const agentResult = await autoManufacturingPlanAgent({
      material: material?.type || 'Unknown',
      subtype: material?.subtype || '',
      grade: material?.grade || '',
      quantity: quantity || 1,
      region: 'Ahmedabad',
      functionality: 'General purpose',
      geometryComplexity: geometry?.complexity > 0.7 ? "High" : 
                         geometry?.complexity > 0.4 ? "Medium" : "Low"
    });

    logger('Agent result:', agentResult);

    // Format the response
    const output: ManufacturingPlanOutput = {
      summary: `Manufacturing plan for "${partName}":
• Process: ${agentResult.recommendedProcess}
• Unit Cost: ₹${agentResult.unitCost.toFixed(2)}
• Tooling Cost: ₹${agentResult.toolingCost.toFixed(2)}
• DFM Risks: ${agentResult.dfmRisks.length} identified`,
      recommendedProcess: agentResult.recommendedProcess,
      toolingStrategy: `Tooling investment: ₹${agentResult.toolingCost.toFixed(2)}`,
      costEstimate: `• Unit Cost: ₹${agentResult.unitCost.toFixed(2)}
• Total Project Cost: ₹${(agentResult.unitCost * (quantity || 1)).toFixed(2)}`,
      regionalSuggestion: 'Recommended manufacturing hub: Ahmedabad (strong manufacturing base)'
    };

    logger('Generated output:', output);
    return output;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error generating manufacturing plan:', errorMsg);
    throw new Error(`Failed to generate manufacturing plan: ${errorMsg}`);
  }
}