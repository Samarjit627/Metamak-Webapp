import { BufferGeometry, Mesh, Vector3, Box3 } from 'three';
import { analyzeFeatures } from './featureRecognition';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:geometryAnalysis');

export function calculateVolumeAndSurfaceAreaFromMesh(mesh: Mesh) {
  try {
    // Apply world matrix (scale, rotation, position) to geometry
    mesh.updateMatrixWorld(true);
    const clonedGeometry = mesh.geometry.clone();
    clonedGeometry.applyMatrix4(mesh.matrixWorld);

    return calculateVolumeAndSurfaceArea(clonedGeometry);
  } catch (error) {
    logger('Error calculating volume and surface area from mesh:', error);
    return { volume: 0, surfaceArea: 0 };
  }
}

export function calculateVolumeAndSurfaceArea(geometry: BufferGeometry) {
  try {
    let volume = 0;
    let surfaceArea = 0;

    const position = geometry.attributes.position;
    if (!position || position.count < 3) {
      return { volume: 0, surfaceArea: 0 };
    }

    const vertices = position.array;

    for (let i = 0; i < position.count; i += 3) {
      const ax = vertices[i * 3 + 0];
      const ay = vertices[i * 3 + 1];
      const az = vertices[i * 3 + 2];
      const bx = vertices[(i + 1) * 3 + 0];
      const by = vertices[(i + 1) * 3 + 1];
      const bz = vertices[(i + 1) * 3 + 2];
      const cx = vertices[(i + 2) * 3 + 0];
      const cy = vertices[(i + 2) * 3 + 1];
      const cz = vertices[(i + 2) * 3 + 2];

      // Signed tetrahedron volume formula
      const v321 = cx * by * az;
      const v231 = bx * cy * az;
      const v312 = cx * ay * bz;
      const v132 = ax * cy * bz;
      const v213 = bx * ay * cz;
      const v123 = ax * by * cz;

      volume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;

      // Triangle surface area (0.5 * |AB x AC|)
      const ab = new Vector3(bx - ax, by - ay, bz - az);
      const ac = new Vector3(cx - ax, cy - ay, cz - az);
      const cross = new Vector3().crossVectors(ab, ac);
      surfaceArea += 0.5 * cross.length();
    }

    // AFTER you compute volume / edges:
    const unitScale = 1; // Default scale factor
    const scaledVolume = Math.abs(volume) * unitScale;  // convert m³→cm³
    const scaledSurfaceArea = surfaceArea * unitScale;  // scale surface area

    return {
      volume: scaledVolume,
      surfaceArea: scaledSurfaceArea
    };
  } catch (error) {
    logger('Error calculating volume and surface area:', error);
    return { volume: 0, surfaceArea: 0 };
  }
}

export async function analyzeGeometry(geometry: BufferGeometry, pullDirection?: Vector3) {
  try {
    logger('Starting geometry analysis');

    if (!geometry || !geometry.attributes.position) {
      throw new Error('Invalid geometry: missing position attribute');
    }

    // Get basic measurements
    const { volume, surfaceArea } = calculateVolumeAndSurfaceArea(geometry);
    
    // Run feature recognition with pull direction
    const pullVector = pullDirection || new Vector3(0, 0, 1); // Z is tool-pull by default
    const featureAnalysis = await analyzeFeatures(geometry, pullVector);
    logger('Feature analysis completed:', featureAnalysis);

    // Calculate manufacturability score (0-1)
    const manufacturabilityScore = calculateManufacturabilityScore(featureAnalysis, featureAnalysis.complexity);

    // Get recommendations based on analysis
    const recommendations = generateRecommendations(featureAnalysis, featureAnalysis.complexity);

    // Calculate dimensions
    geometry.computeBoundingBox();
    const dimensions = geometry.boundingBox ? {
      width: geometry.boundingBox.max.x - geometry.boundingBox.min.x,
      height: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
      depth: geometry.boundingBox.max.z - geometry.boundingBox.min.z
    } : { width: 0, height: 0, depth: 0 };

    logger('Analysis completed successfully');

    return {
      volume: volume || 0,
      surfaceArea: surfaceArea || 0,
      complexity: featureAnalysis.complexity || 0,
      features: {
        thinWalls: featureAnalysis.thinWalls || [],
        undercuts: featureAnalysis.hasUndercuts || false,
        sharpCorners: featureAnalysis.sharpCorners || []
      },
      dimensions,
      manufacturabilityScore: manufacturabilityScore || 0.5,
      recommendations: recommendations || []
    };
  } catch (error) {
    logger('Error in geometry analysis:', error);
    // Return safe default values
    return {
      volume: 0,
      surfaceArea: 0,
      complexity: 0.5,
      features: {
        thinWalls: [],
        undercuts: false,
        sharpCorners: []
      },
      dimensions: { width: 0, height: 0, depth: 0 },
      manufacturabilityScore: 0.5,
      recommendations: ['Unable to analyze geometry']
    };
  }
}

function calculateManufacturabilityScore(
  featureAnalysis: ReturnType<typeof analyzeFeatures>,
  complexity: number
): number {
  try {
    let score = 1.0;

    // Reduce score based on thin walls
    if (featureAnalysis.thinWalls.length > 0) {
      score *= (1 - Math.min(featureAnalysis.thinWalls.length / 20, 0.5));
    }

    // Reduce score based on undercuts
    if (featureAnalysis.hasUndercuts) {
      score *= 0.6;
    }

    // Reduce score based on draft angles
    if (featureAnalysis.maxDraftAngle < 3) {
      score *= 0.8;
    }

    // Reduce score based on complexity
    score *= (1 - (complexity || 0) * 0.3);

    return Math.max(0.1, Math.min(score, 1));
  } catch (error) {
    logger('Error calculating manufacturability score:', error);
    return 0.5; // Return middle score as fallback
  }
}

function generateRecommendations(
  featureAnalysis: ReturnType<typeof analyzeFeatures>,
  complexity: number
): string[] {
  try {
    const recommendations: string[] = [];

    // Thin wall recommendations
    if (featureAnalysis.thinWalls?.length > 0) {
      recommendations.push(
        `Consider increasing wall thickness in ${featureAnalysis.thinWalls.length} identified thin areas`
      );
    }

    // Draft angle recommendations
    if (featureAnalysis.maxDraftAngle < 3) {
      recommendations.push(
        'Add draft angles of at least 3° to vertical walls for better moldability'
      );
    }

    // Undercut recommendations
    if (featureAnalysis.hasUndercuts) {
      recommendations.push(
        'Review undercuts - consider side actions or design changes'
      );
    }

    // Sharp corner recommendations
    if (featureAnalysis.sharpCorners?.length > 0) {
      recommendations.push(
        `Add fillets to ${featureAnalysis.sharpCorners.length} sharp corner(s)`
      );
    }

    // Complexity recommendations
    if (complexity > 0.7) {
      recommendations.push(
        'Consider simplifying geometry to improve manufacturability'
      );
    }

    return recommendations;
  } catch (error) {
    logger('Error generating recommendations:', error);
    return ['Unable to generate recommendations'];
  }
}