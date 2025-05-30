import OpenAI from 'openai';
import { gptTools } from '../gptTools';
import { analyzeDFMRisks } from '../functions/dfmRiskFunctions';
import { estimateTooling } from './toolingEstimator';
import { recommendManufacturingProcess } from './recommendManufacturingProcess';
import { suggestToolingApproach } from './suggestToolingApproach';
import { estimateCost } from './costEstimator';
import { useModelStore } from '../store/modelStore';
import { useUserInputStore } from '../store/userInputStore';
import { getPartContext } from './getPartContext';
import { analyzeFeatures } from './featureRecognition';
import { logToolUsage } from './logToolUsage';
import { getFallbackResponse } from './gptFallbacks';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:gpt');

interface GPTResponse {
  content: string;
  tokens?: number;
  cost?: number;
}

interface FileAttachment {
  type: string;
  data: ArrayBuffer;
  name: string;
}

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getGPTResponse(
  metadata: any | null,
  message: string,
  attachment?: FileAttachment
): Promise<GPTResponse> {
  // Ensure message is always a string
  message = typeof message === 'string' ? message : '';

  try {
    logger('Getting GPT response for:', { message });

    // Get latest parameters from both stores
    const modelStore = useModelStore.getState();
    const userStore = useUserInputStore.getState();
    const partContext = getPartContext();
    const userId = 'temp_user_id'; // Replace with actual user ID

    // Check for DFM analysis request
    if (typeof message === 'string' && (message.toLowerCase().includes('dfm') || message.toLowerCase().includes('design for manufacturing'))) {
      const tool = gptTools.DFM.functionName;
      const inputs = { message };
      try {
        if (!modelStore.currentGeometry) {
          const content = "Please analyze a part first to get DFM insights.";
          logToolUsage({ tool, userId, timestamp: new Date(), status: "failure", inputs, error: 'No geometry available' });
          return { content, tokens: 0, cost: 0 };
        }

        // Run feature recognition
        const features = await analyzeFeatures(modelStore.currentGeometry);

        // Run DFM analysis
        const dfmAnalysis = await analyzeDFMRisks({
          wallThickness: features.minWallThickness,
          draftAngle: features.maxDraftAngle,
          hasUndercuts: features.hasUndercuts,
          complexity: features.complexity,
          volume: partContext.volume,
          material: userStore.material,
          process: modelStore.cadAnalysis?.recommendedProcess
        });

        // Format holes list
        const holesList = features.holes.map(hole => 
          `• Diameter: ${hole.diameter.toFixed(2)}mm at (${hole.position.x.toFixed(1)}, ${hole.position.y.toFixed(1)}, ${hole.position.z.toFixed(1)})`
        ).join('\n');

        // Format thin walls list
        const thinWallsList = features.thinWalls.map(wall => 
          `• Thickness: ${wall.thickness.toFixed(2)}mm at (${wall.position.x.toFixed(1)}, ${wall.position.y.toFixed(1)}, ${wall.position.z.toFixed(1)})`
        ).join('\n');

        // Format ribs list
        const ribsList = features.ribs.map(rib => 
          `• Height: ${rib.height.toFixed(2)}mm, Thickness: ${rib.thickness.toFixed(2)}mm`
        ).join('\n');

        // Format bosses list
        const bossesList = features.bosses.map(boss => 
          `• Diameter: ${boss.diameter.toFixed(2)}mm, Height: ${boss.height.toFixed(2)}mm`
        ).join('\n');

        // Format fillets list
        const filletsList = features.fillets.map(fillet => 
          `• Radius: ${fillet.radius.toFixed(2)}mm`
        ).join('\n');

        // Format chamfers list
        const chamfersList = features.chamfers.map(chamfer => 
          `• Angle: ${chamfer.angle.toFixed(1)}°, Depth: ${chamfer.depth.toFixed(2)}mm`
        ).join('\n');

        // Build feature sections
        const featureSections = [];
        if (features.holes.length > 0) featureSections.push(`\nHoles:\n${holesList}`);
        if (features.thinWalls.length > 0) featureSections.push(`\nThin Walls:\n${thinWallsList}`);
        if (features.ribs.length > 0) featureSections.push(`\nRibs:\n${ribsList}`);
        if (features.bosses.length > 0) featureSections.push(`\nBosses:\n${bossesList}`);
        if (features.fillets.length > 0) featureSections.push(`\nFillets:\n${filletsList}`);
        if (features.chamfers.length > 0) featureSections.push(`\nChamfers:\n${chamfersList}`);

        const content = `🔍 DFM Analysis Results:

Manufacturability Score: ${(dfmAnalysis.manufacturabilityScore * 100).toFixed(1)}%
Severity: ${dfmAnalysis.severity.toUpperCase()}

Part Features:
• Min Wall Thickness: ${features.minWallThickness.toFixed(2)}mm
• Max Draft Angle: ${features.maxDraftAngle.toFixed(1)}°
• Undercuts Present: ${features.hasUndercuts ? 'Yes' : 'No'}
• Complexity Score: ${(features.complexity * 100).toFixed(0)}%${featureSections.join('')}

Identified Risks:
${dfmAnalysis.risks.map(risk => `• ${risk}`).join('\n')}

Recommendations:
${dfmAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}

Would you like me to automatically improve this part for manufacturability?`;

        logToolUsage({ tool, userId, timestamp: new Date(), status: "success", inputs, output: { content } });
        return { content, tokens: 0, cost: 0 };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        logToolUsage({ tool, userId, timestamp: new Date(), status: "failure", inputs, error: errorMsg });
        return getFallbackResponse(tool, { message, error: errorMsg });
      }
    }

    // Check for manufacturing process recommendation
    if (typeof message === 'string' && (message.toLowerCase().includes('process') || message.toLowerCase().includes('manufacturing method'))) {
      const tool = gptTools.PROCESS.functionName;
      const inputs = { message };
      try {
        const processRecommendation = await recommendManufacturingProcess({
          material: userStore.material,
          materialSubtype: userStore.materialSubtype,
          materialGrade: userStore.grade,
          quantity: userStore.quantity,
          geometryComplexity: partContext.complexity > 0.7 ? "High" :
                            partContext.complexity > 0.4 ? "Medium" : "Low"
        });

        logToolUsage({ tool, userId, timestamp: new Date(), status: "success", inputs, output: processRecommendation });
        return {
          content: processRecommendation.content,
          tokens: 0,
          cost: 0
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        logToolUsage({ tool, userId, timestamp: new Date(), status: "failure", inputs, error: errorMsg });
        return getFallbackResponse(tool, { message, error: errorMsg });
      }
    }

    // Check for tooling approach suggestion
    if (message.toLowerCase().includes('tooling') || message.toLowerCase().includes('tool')) {
      const tool = gptTools.TOOLING.functionName;
      const inputs = { message };
      try {
        const toolingApproach = await suggestToolingApproach({
          material: userStore.material,
          materialSubtype: userStore.materialSubtype,
          materialGrade: userStore.grade,
          quantity: userStore.quantity,
          complexity: partContext.complexity,
          volume: partContext.volume
        });

        logToolUsage({ tool, userId, timestamp: new Date(), status: "success", inputs, output: toolingApproach });
        return {
          content: toolingApproach.content,
          tokens: 0,
          cost: 0
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        logToolUsage({ tool, userId, timestamp: new Date(), status: "failure", inputs, error: errorMsg });
        return getFallbackResponse(tool, { message, error: errorMsg });
      }
    }

    // Enhance metadata with current manufacturing parameters and part context
    const enhancedMetadata = {
      ...metadata,
      ...partContext,
      material: userStore.material,
      materialSubtype: userStore.materialSubtype,
      materialGrade: userStore.grade,
      location: userStore.location,
      quantity: userStore.quantity
    };

    logger('Sending request to GPT with enhanced metadata');

    // Create functions array from gptTools
    const functions = Object.values(gptTools).map(tool => ({
      name: tool.functionName,
      description: tool.description,
      parameters: tool.parameters
    }));

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a manufacturing expert assistant. Current Manufacturing Parameters:
- Material: ${enhancedMetadata.material} (${enhancedMetadata.materialSubtype}${enhancedMetadata.materialGrade ? `, Grade: ${enhancedMetadata.materialGrade}` : ''})
- Location: ${enhancedMetadata.location}
- Quantity: ${enhancedMetadata.quantity} units

Part Metadata:
${JSON.stringify(enhancedMetadata, null, 2)}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        functions,
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 1000
      });

      const responseMessage = response.choices[0].message;

      if (responseMessage.function_call) {
        logger('GPT called function:', responseMessage.function_call.name);
        
        const args = JSON.parse(responseMessage.function_call.arguments);
        let functionResponse;

        const tool = responseMessage.function_call.name;
        const inputs = args;

        try {
          switch (tool) {
            case gptTools.DFM.functionName:
              functionResponse = await analyzeDFMRisks({
                ...args,
                ...partContext,
                material: userStore.material,
                materialGrade: userStore.grade,
                quantity: userStore.quantity
              });
              break;

            case gptTools.TOOLING.functionName:
              functionResponse = await estimateTooling({
                material: userStore.material,
                materialSubtype: userStore.materialSubtype,
                materialGrade: userStore.grade,
                quantity: userStore.quantity,
                complexity: partContext.complexity,
                partSize: partContext.volume > 1000 ? "Large" : 
                         partContext.volume > 100 ? "Medium" : "Small"
              });
              break;

            case gptTools.PROCESS.functionName:
              functionResponse = await recommendManufacturingProcess({
                material: userStore.material,
                materialSubtype: userStore.materialSubtype,
                materialGrade: userStore.grade,
                quantity: userStore.quantity
              });
              break;

            case gptTools.APPROACH.functionName:
              functionResponse = await suggestToolingApproach({
                material: userStore.material,
                materialSubtype: userStore.materialSubtype,
                materialGrade: userStore.grade,
                quantity: userStore.quantity,
                complexity: partContext.complexity,
                volume: partContext.volume
              });
              break;
          }

          logToolUsage({ tool, userId, timestamp: new Date(), status: "success", inputs, output: functionResponse });

          return {
            content: functionResponse.content || JSON.stringify(functionResponse, null, 2),
            tokens: response.usage?.total_tokens,
            cost: calculateCost(
              response.usage?.prompt_tokens || 0,
              response.usage?.completion_tokens || 0
            )
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
          logToolUsage({ tool, userId, timestamp: new Date(), status: "failure", inputs, error: errorMsg });
          return getFallbackResponse(tool, { ...args, error: errorMsg });
        }
      }

      logToolUsage({ 
        tool: 'GPT_DIRECT', 
        userId, 
        timestamp: new Date(), 
        status: "success", 
        inputs: { message }, 
        output: { content: responseMessage.content } 
      });

      return {
        content: responseMessage.content || 'No response generated',
        tokens: response.usage?.total_tokens,
        cost: calculateCost(
          response.usage?.prompt_tokens || 0,
          response.usage?.completion_tokens || 0
        )
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      logToolUsage({ 
        tool: 'GPT_DIRECT', 
        userId, 
        timestamp: new Date(), 
        status: "failure", 
        inputs: { message }, 
        error: errorMsg 
      });
      
      return {
        content: `I apologize, but I encountered an error: ${errorMsg}. Please try again.`,
        tokens: 0,
        cost: 0
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in GPT response:', errorMsg);
    return {
      content: `I apologize, but I encountered an error: ${errorMsg}. Please try again.`,
      tokens: 0,
      cost: 0
    };
  }
}

function calculateCost(promptTokens: number, completionTokens: number): number {
  // GPT-4 pricing: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
  return (promptTokens * 0.03 / 1000) + (completionTokens * 0.06 / 1000);
}