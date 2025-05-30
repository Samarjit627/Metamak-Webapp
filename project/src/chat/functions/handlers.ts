import { autoManufacturingPlanAgent } from '../../agents/autoManufacturingPlanAgent';
import { analyzeDFMRisks } from '../../functions/dfmRiskFunctions';
import { estimateTooling } from '../../utils/toolingEstimator';
import { useModelStore } from '../../store/modelStore';
import { recommendManufacturingProcess } from '../../utils/recommendManufacturingProcess';
import { suggestToolingApproach } from '../../utils/suggestToolingApproach';
import { gptTools } from '../../gptTools';
import { useUserInputStore } from '../../store/userInputStore';
import debug from 'debug';

const logger = debug('app:functionHandlers');

export async function handleFunctionCall(functionName: string, args: any) {
  try {
    logger('Handling function call:', { functionName, args });

    const { cadAnalysis } = useModelStore.getState();
    const { material, materialSubtype, grade, quantity } = useUserInputStore.getState();

    const enrichedArgs = {
      ...args,
      volumeCm3: cadAnalysis?.volume,
      complexity: cadAnalysis?.complexity,
      material,
      materialSubtype,
      materialGrade: grade,
      quantity
    };

    logger('Enriched arguments with context:', enrichedArgs);

    switch (functionName) {
      case gptTools.DFM.functionName:
        return await analyzeDFMRisks(enrichedArgs);

      case gptTools.TOOLING.functionName:
        return await estimateTooling(enrichedArgs);

      case gptTools.PROCESS.functionName:
        return await recommendManufacturingProcess(enrichedArgs);

      case gptTools.APPROACH.functionName:
        return await suggestToolingApproach(enrichedArgs);

      case gptTools.PLAN.functionName:
        return await autoManufacturingPlanAgent(enrichedArgs);

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in function handler:', errorMsg);
    return {
      content: `I apologize, but I encountered an error while processing your request: ${errorMsg}. Please try again or check the input parameters.`,
      error: true
    };
  }
}