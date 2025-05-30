import { recommendManufacturingProcess } from "../utils/recommendManufacturingProcess";
import { estimateTooling } from "../utils/toolingEstimator";
import { calculateManufacturingCosts } from "../utils/costUtils";
import { analyzeDFMRisks } from "../functions/dfmRiskFunctions";
import { getGPTResponse } from "../utils/callGPT";
import { getPartContext } from "../utils/getPartContext";
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:autoManufacturingPlanAgent');

export interface PartContext {
  material: string;
  subtype: string;
  grade: string;
  quantity: number;
  region: string;
  functionality: string;
  geometryComplexity?: "Low" | "Medium" | "High";
}

export interface PlanOutput {
  recommendedProcess: string;
  alternativeProcesses: string[];
  toolingCost: number;
  unitCost: number;
  dfmRisks: string[];
  decisionNarrative: string;
}

export async function autoManufacturingPlanAgent(part: PartContext): Promise<PlanOutput> {
  try {
    logger('Starting manufacturing plan analysis with input:', part);

    // Get full part context
    const partContext = getPartContext();
    logger('Retrieved part context:', partContext);

    const {
      material,
      subtype,
      grade,
      quantity,
      region,
      functionality,
      geometryComplexity = "Medium"
    } = part;

    // Step 1: Recommend process
    logger('Recommending manufacturing process...');
    const processRecommendation = await recommendManufacturingProcess({
      material,
      materialSubtype: subtype,
      materialGrade: grade,
      quantity,
      geometryComplexity
    });
    logger('Process recommendation:', processRecommendation);

    // Extract primary process and alternatives from the recommendation
    const processContent = processRecommendation.content;
    const primary = processContent.match(/Recommended Primary Process: ([^\n]+)/)?.[1] || 'CNC Machining';
    
    // Extract alternative processes
    const alternativesSection = processContent.match(/Alternative Processes:\n((?:• [^\n]+\n?)+)/)?.[1] || '';
    const alternatives = alternativesSection
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace('• ', '').trim())
      .filter(Boolean);

    // Step 2: Calculate costs
    logger('Calculating manufacturing costs...');
    const costs = calculateManufacturingCosts({
      material,
      materialSubtype: subtype,
      materialGrade: grade,
      volume: partContext.volume,
      complexity: partContext.complexity,
      quantity
    });
    logger('Cost calculation result:', costs);

    // Step 3: Estimate tooling
    logger('Estimating tooling costs...');
    const toolingEstimate = await estimateTooling({
      material,
      materialSubtype: subtype,
      materialGrade: grade,
      process: primary,
      quantity,
      complexity: geometryComplexity,
      partSize: partContext.volume > 1000 ? "Large" : 
                partContext.volume > 100 ? "Medium" : "Small"
    });
    logger('Tooling estimate:', toolingEstimate);

    // Step 4: Run DFM risk check
    logger('Analyzing DFM risks...');
    const dfmAnalysis = analyzeDFMRisks({
      wallThickness: partContext.wallThickness,
      draftAngle: 1.0,
      hasUndercuts: partContext.undercuts,
      complexity: partContext.complexity,
      volume: partContext.volume,
      material,
      process: primary
    });
    logger('DFM analysis result:', dfmAnalysis);

    // Step 5: Generate smart narration
    logger('Generating smart narration...');
    const narrationPrompt = `
You're a senior manufacturing engineer. Here is the part context:

- Material: ${material} (${subtype}, Grade: ${grade})
- Functionality: ${functionality}
- Quantity: ${quantity} units
- Region: ${region}
- Recommended Process: ${primary}
- Tooling Cost: ₹${toolingEstimate.toFixed(0)}
- Unit Cost: ₹${costs.totalUnitCost.toFixed(2)}
- DFM Risks: ${dfmAnalysis.risks.join(", ") || "None"}
- Part Volume: ${partContext.volume.toFixed(2)} cm³
- Complexity Score: ${partContext.complexity.toFixed(2)}
- Wall Thickness: ${partContext.wallThickness.toFixed(2)} mm
- Undercuts Present: ${partContext.undercuts ? "Yes" : "No"}

Write a 4-5 sentence professional explanation on:
1. Why this process was chosen
2. What risks or considerations the user should know
3. Any alternative suggestion briefly
4. Closing reassurance like: "Let me know if you want to explore alternatives"
`;

    const narrationResponse = await getGPTResponse(null, narrationPrompt);
    const decisionNarrative = narrationResponse.content;
    logger('Generated narrative:', decisionNarrative);

    return {
      recommendedProcess: primary,
      alternativeProcesses: alternatives,
      toolingCost: toolingEstimate,
      unitCost: costs.totalUnitCost,
      dfmRisks: dfmAnalysis.risks,
      decisionNarrative
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in manufacturing plan analysis:', errorMsg);
    throw new Error(`Failed to generate manufacturing plan: ${errorMsg}`);
  }
}