import { getGPTResponse } from '../../utils/callGPT';
import { getPartContext } from '../../utils/getPartContext';
import { gptTools } from '../../gptTools';
import { useUserInputStore } from '../../store/userInputStore';
import { useModelStore } from '../../store/modelStore';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:gptFunctions');

export async function callGPTWithContext(messages: any[], functions: any[]) {
  try {
    logger('Preparing GPT call with context');

    const context = await getPartContext();
    const { material, materialSubtype, grade, location, quantity } = useUserInputStore.getState();
    const { fileName } = useModelStore.getState();
    logger('Retrieved part context:', context);

    const manufacturingInfo = `
Material: ${material} (${materialSubtype}${grade ? `, Grade: ${grade}` : ''})
Location: ${location}
Quantity: ${quantity} units
Part Volume: ${context.volume.toFixed(2)} cm³
Wall Thickness: ${context.wallThickness.toFixed(2)} mm
Complexity Score: ${(context.complexity * 100).toFixed(0)}%
`;

    const systemMessage = {
      role: 'system',
      content: `You are a manufacturing expert assistant analyzing ${fileName || 'a part'}. Current Manufacturing Parameters:
${manufacturingInfo}

Part Context:
${JSON.stringify(context, null, 2)}`
    };

    messages.unshift(systemMessage);

    const response = await getGPTResponse(messages, functions);
    logger('GPT response received');

    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in GPT function call:', errorMsg);
    
    return {
      role: 'assistant',
      content: `⚠️ I couldn't generate a manufacturing plan because some required parameters (like material, volume, quantity) were missing. Please check the part metadata.`
    };
  }
}