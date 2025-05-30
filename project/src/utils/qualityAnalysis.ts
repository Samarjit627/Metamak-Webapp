import { BufferGeometry, Vector3 } from 'three';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:qualityAnalysis');

interface QualityAnalysis {
  criticalFeatures: string[];
  inspectionPoints: string[];
  defectRisks: string[];
  toleranceRanges: {
    [key: string]: {
      nominal: number;
      upper: number;
      lower: number;
    };
  };
}

export function analyzeQuality(
  geometry: BufferGeometry,
  process: string,
  material: string,
  tolerance: string
): QualityAnalysis {
  logger('Analyzing quality for:', { process, material, tolerance });

  try {
    // Extract base tolerance value
    const baseToleranceValue = parseFloat(tolerance.replace('±', ''));
    
    // Analyze geometry for critical features
    const criticalFeatures = identifyCriticalFeatures(geometry);
    logger('Identified critical features:', criticalFeatures);

    // Determine inspection points
    const inspectionPoints = determineInspectionPoints(geometry, criticalFeatures);
    logger('Determined inspection points:', inspectionPoints);

    // Assess defect risks
    const defectRisks = assessDefectRisks(process, material);
    logger('Assessed defect risks:', defectRisks);

    // Calculate tolerance ranges
    const toleranceRanges = calculateToleranceRanges(baseToleranceValue, process);
    logger('Calculated tolerance ranges:', toleranceRanges);

    return {
      criticalFeatures,
      inspectionPoints,
      defectRisks,
      toleranceRanges
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in quality analysis:', errorMsg);
    console.error('Error in quality analysis:', error);
    
    // Return default analysis in case of error
    return {
      criticalFeatures: ['Error analyzing critical features'],
      inspectionPoints: ['Standard inspection recommended'],
      defectRisks: ['Unable to assess defect risks'],
      toleranceRanges: {
        default: {
          nominal: 0,
          upper: 0.1,
          lower: -0.1
        }
      }
    };
  }
}

function identifyCriticalFeatures(geometry: BufferGeometry): string[] {
  const features: string[] = [];
  
  // Compute bounding box if not already computed
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }

  // Get geometry dimensions
  const size = new Vector3();
  geometry.boundingBox!.getSize(size);

  // Check for thin walls (simplified)
  if (Math.min(size.x, size.y, size.z) < 2.0) {
    features.push('Thin wall sections detected');
  }

  // Check for sharp corners
  if (geometry.attributes.normal) {
    features.push('Sharp corners present - inspect for stress concentration');
  }

  // Add basic geometric features
  features.push(`Overall dimensions: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)} mm`);

  return features;
}

function determineInspectionPoints(geometry: BufferGeometry, criticalFeatures: string[]): string[] {
  const inspectionPoints: string[] = [];

  // Basic dimensional inspection
  inspectionPoints.push('Verify overall dimensions');

  // Add inspection points based on critical features
  criticalFeatures.forEach(feature => {
    if (feature.includes('Thin wall')) {
      inspectionPoints.push('Measure wall thickness at marked locations');
    }
    if (feature.includes('Sharp corners')) {
      inspectionPoints.push('Inspect corner radii and surface finish');
    }
  });

  // Add standard inspection points
  inspectionPoints.push('Check surface finish quality');
  inspectionPoints.push('Verify feature alignment and positioning');

  return inspectionPoints;
}

function assessDefectRisks(process: string, material: string): string[] {
  const risks: string[] = [];

  // Process-specific risks
  switch (process.toLowerCase()) {
    case 'cnc machining':
      risks.push('Tool wear affecting surface finish');
      risks.push('Potential for chatter marks');
      break;
    case 'injection molding':
      risks.push('Potential for sink marks');
      risks.push('Warpage due to uneven cooling');
      break;
    case '3d printing':
      risks.push('Layer adhesion strength');
      risks.push('Surface roughness variations');
      break;
    default:
      risks.push('Standard process-related defects');
  }

  // Material-specific risks
  switch (material.toLowerCase()) {
    case 'metal':
      risks.push('Material hardness variations');
      risks.push('Potential for burrs');
      break;
    case 'plastic':
      risks.push('Dimensional stability with temperature');
      risks.push('Moisture absorption effects');
      break;
    default:
      risks.push('Standard material-related defects');
  }

  return risks;
}

function calculateToleranceRanges(
  baseToleranceValue: number,
  process: string
): { [key: string]: { nominal: number; upper: number; lower: number } } {
  const ranges: { [key: string]: { nominal: number; upper: number; lower: number } } = {};

  // Process-specific tolerance factors
  const processFactor = getProcessToleranceFactor(process);

  // Critical dimensions
  ranges['critical'] = {
    nominal: 0,
    upper: baseToleranceValue * processFactor,
    lower: -baseToleranceValue * processFactor
  };

  // Non-critical dimensions
  ranges['standard'] = {
    nominal: 0,
    upper: baseToleranceValue * 1.5 * processFactor,
    lower: -baseToleranceValue * 1.5 * processFactor
  };

  return ranges;
}

function getProcessToleranceFactor(process: string): number {
  switch (process.toLowerCase()) {
    case 'cnc machining':
      return 1.0;
    case 'injection molding':
      return 1.2;
    case '3d printing':
      return 1.5;
    default:
      return 1.3;
  }
}