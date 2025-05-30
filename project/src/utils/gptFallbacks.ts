import { gptTools } from '../gptTools';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:gptFallbacks');

interface FallbackResponse {
  content: string;
  tokens: number;
  cost: number;
}

const fallbacks: Record<string, (args: any) => FallbackResponse> = {
  [gptTools.DFM.functionName]: (args) => ({
    content: `Here's a basic DFM assessment based on standard guidelines:

• Check wall thickness (should be > 1.5mm)
• Ensure draft angles > 1° for vertical walls
• Avoid sharp corners (use fillets)
• Consider part orientation during manufacturing
• Review material selection for manufacturability

Would you like me to analyze any specific aspect in more detail?`,
    tokens: 0,
    cost: 0
  }),

  [gptTools.PROCESS.functionName]: (args) => ({
    content: `Based on general manufacturing guidelines:

For ${args.material || 'your material'}, common processes include:
• CNC Machining (good for prototypes and low volume)
• Injection Molding (ideal for high volume plastic parts)
• Die Casting (for high volume metal parts)

Would you like more details about any of these processes?`,
    tokens: 0,
    cost: 0
  }),

  [gptTools.TOOLING.functionName]: (args) => ({
    content: `Standard tooling considerations:

• Prototype tooling: ₹50,000 - ₹150,000
• Production tooling: ₹150,000 - ₹500,000
• Lead time: 4-8 weeks
• Material dependent factors will apply

Would you like a more detailed estimate?`,
    tokens: 0,
    cost: 0
  }),

  [gptTools.APPROACH.functionName]: (args) => ({
    content: `General tooling approach guidelines:

• Consider soft tooling for < 1000 units
• Use production tooling for > 1000 units
• Plan for maintenance every 10,000 cycles
• Factor in material wear characteristics

Would you like specific recommendations?`,
    tokens: 0,
    cost: 0
  })
};

export function getFallbackResponse(tool: string, args: any): FallbackResponse {
  try {
    logger('Getting fallback response for tool:', tool);
    const fallback = fallbacks[tool];
    
    if (!fallback) {
      logger('No fallback found for tool:', tool);
      return {
        content: "I apologize, but I'm having trouble processing this request. Please try again or rephrase your question.",
        tokens: 0,
        cost: 0
      };
    }

    return fallback(args);
  } catch (error) {
    logger('Error getting fallback response:', error);
    return {
      content: "I apologize, but I encountered an error. Please try again.",
      tokens: 0,
      cost: 0
    };
  }
}