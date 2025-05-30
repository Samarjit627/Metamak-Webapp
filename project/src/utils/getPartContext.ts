import { useModelStore } from '../store/modelStore';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:getPartContext');

export const getPartContext = () => {
  try {
    logger('Getting part context...');

    const { cadAnalysis, selectedMesh } = useModelStore.getState();

    if (!cadAnalysis) {
      logger('No CAD analysis available, returning default context');
      return {
        volume: 100,
        surfaceArea: 200,
        complexity: 0.5,
        wallThickness: 2,
        undercuts: false,
        manufacturabilityScore: 0.7,
        dimensions: {
          width: 100,
          height: 100,
          depth: 100
        },
        features: {
          thinWalls: [],
          undercuts: [],
          sharpCorners: []
        }
      };
    }

    // Extract dimensions from CAD analysis
    const dimensions = cadAnalysis.dimensions || {
      width: 100,
      height: 100,
      depth: 100
    };

    // Calculate wall thickness from geometry if available
    const wallThickness = cadAnalysis.features?.thinWalls?.[0]?.thickness || 2;

    // Check for undercuts in features
    const hasUndercuts = Boolean(cadAnalysis.features?.undercuts);

    // AFTER you compute volume / edges:
    const unitScale = selectedMesh?.userData?.unit === "m" ? 1000 : 1;
    const scaledVolume = cadAnalysis.volume * unitScale;  // convert m³→cm³

    const context = {
      volume: scaledVolume,
      surfaceArea: cadAnalysis.surfaceArea || 200,
      complexity: cadAnalysis.complexity || 0.5,
      wallThickness,
      undercuts: hasUndercuts,
      manufacturabilityScore: cadAnalysis.manufacturabilityScore || 0.7,
      dimensions,
      features: cadAnalysis.features || {
        thinWalls: [],
        undercuts: [],
        sharpCorners: []
      }
    };

    logger('Generated part context:', context);
    return context;
  } catch (error) {
    logger('Error getting part context:', error);
    // Return safe default values
    return {
      volume: 100,
      surfaceArea: 200,
      complexity: 0.5,
      wallThickness: 2,
      undercuts: false,
      manufacturabilityScore: 0.7,
      dimensions: {
        width: 100,
        height: 100,
        depth: 100
      },
      features: {
        thinWalls: [],
        undercuts: [],
        sharpCorners: []
      }
    };
  }
};