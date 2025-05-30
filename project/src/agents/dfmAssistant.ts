import { Mesh } from 'three';
import { useModelStore } from '../store/modelStore';
import { useChatStore } from '../store/chatStore';
import { analyzeFeatures } from '../utils/featureRecognition';
import { analyzeDFMRisksWithGPT } from '../functions/analyzeDFMRisksWithGPT';
import { generateV2WithFixes } from './FixAllPlanner';
import { logToolUsage } from '../utils/logToolUsage';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:dfmAssistant');

interface Message {
  type: 'assistant';
  content: string;
  id: string;
  timestamp: Date;
}

let isProcessing = false;

export async function dfmAssistant(mesh: Mesh | null): Promise<void> {
  try {
    if (isProcessing) {
      logger('DFM analysis already in progress');
      return;
    }

    isProcessing = true;
    logger('Starting DFM analysis');
    const { addMessage } = useChatStore.getState();

    if (!mesh || !mesh.geometry) {
      throw new Error('No valid mesh geometry provided for analysis');
    }

    // Analyze the part features
    const analysis = await analyzeFeatures(mesh.geometry);
    logger('Feature analysis completed:', analysis);

    // Prepare DFM parameters for hybrid analysis (with safe fallbacks)
    const dfmParams = {
      wallThickness: analysis.minWallThickness,
      draftAngle: analysis.maxDraftAngle,
      hasUndercuts: analysis.hasUndercuts,
      complexity: analysis.complexity,
      material: '',
      process: ''
    };

    // --- HYBRID DFM CALL ---
    let hybridResult;
    try {
      logger('Calling analyzeDFMRisksWithGPT with params:', dfmParams);
      // Add a timeout to prevent hanging forever
      hybridResult = await Promise.race([
        analyzeDFMRisksWithGPT(dfmParams),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DFM analysis timed out after 30s')), 30000))
      ]);
      logger('Hybrid DFM result:', hybridResult);
    } catch (err) {
      logger('Hybrid DFM analysis failed:', err);
      hybridResult = null;
      addMessage({
        type: 'assistant',
        content: `⚠️ Error running hybrid DFM analysis: ${err instanceof Error ? err.message : String(err)}`,
        id: Date.now().toString(),
        timestamp: new Date()
      });
    }

    // Compose message
    let content = `🔍 DFM Analysis Results (Hybrid):\n\n`;
    if (hybridResult) {
      content += `Risks: ${hybridResult.risks?.join('\n') || 'None'}\n`;
      content += `Recommendations: ${hybridResult.recommendations?.join('\n') || 'None'}\n`;
      if (hybridResult.gptSummary) content += `\nGPT Insights:\n${hybridResult.gptSummary}\n`;
    } else {
      content += '⚠️ Error running hybrid DFM analysis.';
    }

    addMessage({
      type: 'assistant',
      content,
      id: Date.now().toString(),
      timestamp: new Date()
    });

    logger('DFM analysis completed');

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in DFM assistant:', errorMsg);
    const errorMessage: Message = {
      type: 'assistant',
      content: `⚠️ Error analyzing part: ${errorMsg}. Please ensure the part is properly loaded and try again.`,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    useChatStore.getState().addMessage(errorMessage);
  } finally {
    isProcessing = false;
  }
}

let isFixing = false;

export const handleFixPart = async (mesh: Mesh): Promise<void> => {
  if (!mesh) {
    throw new Error('No mesh provided for fixing');
  }

  if (isFixing) {
    logger('Part fix already in progress');
    return;
  }
  
  try {
    isFixing = true;
    const { addMessage } = useChatStore.getState();
    
    // Generate V2 with fixes
    const { updated: revisedMesh, summary } = await generateV2WithFixes(mesh);
    
    // Update model store with V2 mesh
    useModelStore.getState().setSelectedMesh(revisedMesh);
    
    // Send completion message
    addMessage({
      type: 'assistant',
      content: `✅ V2 created with manufacturing improvements.\n\n${summary}\n\nWould you like to explore any specific improvements in detail?`,
      id: Date.now().toString(),
      timestamp: new Date()
    });

    logToolUsage({
      tool: 'DFM_FIX',
      userId: 'temp_user_id',
      timestamp: new Date(),
      status: 'success',
      inputs: { meshId: mesh.uuid }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error fixing part:', errorMsg);
    
    logToolUsage({
      tool: 'DFM_FIX',
      userId: 'temp_user_id',
      timestamp: new Date(),
      status: 'failure',
      inputs: { meshId: mesh.uuid },
      error
    });
    
    throw error;
  } finally {
    isFixing = false;
  }
};