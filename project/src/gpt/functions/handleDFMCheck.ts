import { Vector3 } from 'three';
import { analyzeFeatures } from "../../utils/featureRecognition";
import { formatDFMInsights } from "../../utils/formatDFMInsights";
import { useModelStore } from "../../store/modelStore";
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:handleDFMCheck');

export async function handleDFMCheck(): Promise<string> {
  try {
    logger('Starting DFM check');
    
    const { currentGeometry, selectedParts, cadAnalysis, selectedMesh } = useModelStore.getState();
    
    if (!currentGeometry && (!selectedParts || selectedParts.length === 0) && !cadAnalysis) {
      logger('No geometry available for analysis');
      return "⚠️ No part selected. Please upload and select a part to analyze.";
    }
    
    // Use current geometry if available, otherwise use the geometry of the first selected part
    const geometry = currentGeometry || (selectedMesh && selectedMesh.geometry) || (selectedParts[0] && selectedParts[0].geometry);
    
    if (!geometry) {
      logger('No valid geometry found for analysis');
      return "⚠️ Unable to access part geometry. Please try selecting the part again.";
    }
    
    logger('Analyzing features with geometry');
    
    // Align pull-direction for analysis
    const pullDirection = new Vector3(0, 0, 1); // Z is tool-pull
    const result = await analyzeFeatures(geometry, pullDirection);
    logger('Feature analysis completed');
    
    const formattedInsights = formatDFMInsights(result);
    logger('DFM insights formatted');
    
    return formattedInsights;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in DFM check:', errorMsg);
    return `⚠️ Error analyzing DFM: ${errorMsg}. Please try again with a different part.`;
  }
}