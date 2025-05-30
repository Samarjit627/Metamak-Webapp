import { FeatureAnalysisResult } from "./featureRecognition";
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:formatDFMInsights');

// Maximum number of items to show per feature category
const MAX_ITEMS_TO_DISPLAY = 3;

export function formatDFMInsights(analysis: FeatureAnalysisResult): string {
  try {
    logger('Formatting DFM insights from analysis');
    
    // Format holes summary
    let holesSummary = '';
    if (analysis.holes.length > 0) {
      const displayHoles = analysis.holes.slice(0, MAX_ITEMS_TO_DISPLAY);
      holesSummary = displayHoles.map(hole => 
        `• Diameter: ${hole.diameter.toFixed(2)}mm`
      ).join('\n');
      
      if (analysis.holes.length > MAX_ITEMS_TO_DISPLAY) {
        holesSummary += `\n• ... and ${analysis.holes.length - MAX_ITEMS_TO_DISPLAY} more holes`;
      }
    }

    // Format thin walls summary
    let thinWallsSummary = '';
    if (analysis.thinWalls.length > 0) {
      const displayWalls = analysis.thinWalls.slice(0, MAX_ITEMS_TO_DISPLAY);
      thinWallsSummary = displayWalls.map(wall => 
        `• Thickness: ${wall.thickness.toFixed(2)}mm`
      ).join('\n');
      
      if (analysis.thinWalls.length > MAX_ITEMS_TO_DISPLAY) {
        thinWallsSummary += `\n• ... and ${analysis.thinWalls.length - MAX_ITEMS_TO_DISPLAY} more thin areas`;
      }
    }

    // Format ribs summary
    let ribsSummary = '';
    if (analysis.ribs.length > 0) {
      const displayRibs = analysis.ribs.slice(0, MAX_ITEMS_TO_DISPLAY);
      ribsSummary = displayRibs.map(rib => 
        `• Height: ${rib.height.toFixed(2)}mm, Thickness: ${rib.thickness.toFixed(2)}mm`
      ).join('\n');
      
      if (analysis.ribs.length > MAX_ITEMS_TO_DISPLAY) {
        ribsSummary += `\n• ... and ${analysis.ribs.length - MAX_ITEMS_TO_DISPLAY} more ribs`;
      }
    }

    // Format bosses summary
    let bossesSummary = '';
    if (analysis.bosses.length > 0) {
      const displayBosses = analysis.bosses.slice(0, MAX_ITEMS_TO_DISPLAY);
      bossesSummary = displayBosses.map(boss => 
        `• Diameter: ${boss.diameter.toFixed(2)}mm, Height: ${boss.height.toFixed(2)}mm`
      ).join('\n');
      
      if (analysis.bosses.length > MAX_ITEMS_TO_DISPLAY) {
        bossesSummary += `\n• ... and ${analysis.bosses.length - MAX_ITEMS_TO_DISPLAY} more bosses`;
      }
    }

    // Format sharp corners summary
    let sharpCornersSummary = '';
    if (analysis.sharpCorners.length > 0) {
      const displayCorners = analysis.sharpCorners.slice(0, MAX_ITEMS_TO_DISPLAY);
      sharpCornersSummary = displayCorners.map(corner => 
        `• Angle: ${corner.angle.toFixed(1)}°`
      ).join('\n');
      
      if (analysis.sharpCorners.length > MAX_ITEMS_TO_DISPLAY) {
        sharpCornersSummary += `\n• ... and ${analysis.sharpCorners.length - MAX_ITEMS_TO_DISPLAY} more sharp corners`;
      }
    }

    // Build feature sections
    const featureSections = [];
    if (analysis.holes.length > 0) featureSections.push(`\nHoles:\n${holesSummary}`);
    if (analysis.thinWalls.length > 0) featureSections.push(`\nThin Walls:\n${thinWallsSummary}`);
    if (analysis.ribs.length > 0) featureSections.push(`\nRibs:\n${ribsSummary}`);
    if (analysis.bosses.length > 0) featureSections.push(`\nBosses:\n${bossesSummary}`);
    if (analysis.sharpCorners.length > 0) featureSections.push(`\nSharp Corners:\n${sharpCornersSummary}`);

    // Calculate manufacturability score
    const manufacturabilityScore = Math.round((1 - analysis.complexity) * 100);

    const formattedInsights = `🔍 DFM Analysis Results:

Manufacturability Score: ${manufacturabilityScore}%
Severity: ${analysis.hasUndercuts ? 'HIGH' : analysis.thinWalls.length > 0 ? 'MEDIUM' : 'LOW'}

Part Features:
• Min Wall Thickness: ${analysis.minWallThickness.toFixed(2)}mm
• Max Draft Angle: ${analysis.maxDraftAngle.toFixed(1)}°
• Undercuts Present: ${analysis.hasUndercuts ? 'Yes' : 'No'}
• Complexity Score: ${(analysis.complexity * 100).toFixed(0)}%${featureSections.join('')}

Recommendations:
${analysis.minWallThickness < 1.5 ? '• Increase wall thickness to at least 1.5mm\n' : ''}
${analysis.maxDraftAngle < 3 ? '• Add draft angles of at least 3° to vertical walls\n' : ''}
${analysis.hasUndercuts ? '• Consider redesigning to eliminate undercuts or use side actions\n' : ''}
${analysis.sharpCorners.length > 0 ? '• Add fillets to sharp corners to reduce stress concentration\n' : ''}
${analysis.complexity > 0.7 ? '• Consider simplifying geometry to improve manufacturability\n' : ''}
${!analysis.hasUndercuts && analysis.minWallThickness >= 1.5 && analysis.sharpCorners.length === 0 ? '• No major DFM issues detected\n' : ''}

Would you like me to analyze any specific aspect in more detail?`;

    logger('Formatted DFM insights successfully');
    return formattedInsights;
  } catch (error) {
    logger('Error formatting DFM insights:', error);
    return "⚠️ Error formatting DFM analysis. Please try again.";
  }
}