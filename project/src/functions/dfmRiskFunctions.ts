import { Vector3, BufferGeometry } from 'three';
import { getPartContext } from '../utils/getPartContext';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:dfmRiskFunctions');

export interface DFMFaceRisk {
  faceIndex: number;
  type: "thin_wall" | "undercut" | "sharp_corner";
  severity?: number;
  riskScore: number; // normalized 0-1
}

export interface DFMParameters {
  wallThickness?: number;
  draftAngle?: number;
  hasUndercuts?: boolean;
  complexity?: number;
  volume?: number;
  material?: string;
  process?: string;
}

export interface DFMRiskAnalysis {
  risks: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  manufacturabilityScore: number;
}

export async function analyzeDFMRisks(params: DFMParameters): Promise<DFMRiskAnalysis> {
  try {
    logger('Starting DFM risk analysis with params:', params);

    // Get part context
    const context = getPartContext();
    logger('Retrieved part context:', context);

    const risks: string[] = [];
    const recommendations: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';
    let riskScore = 0;

    // Wall thickness analysis using actual part data
    const minWallThickness = params.wallThickness || context.wallThickness;
    if (minWallThickness < 1.0) {
      risks.push(`Critical thin walls detected (${minWallThickness.toFixed(2)}mm)`);
      recommendations.push('Increase wall thickness to at least 1.5mm');
      riskScore += 3;
      severity = 'high';
    } else if (minWallThickness < 1.5) {
      risks.push(`Thin walls may affect manufacturability (${minWallThickness.toFixed(2)}mm)`);
      recommendations.push('Consider increasing wall thickness to 1.5-2mm');
      riskScore += 2;
      severity = Math.max(severity === 'high' ? 2 : 1, 1) === 2 ? 'high' : 'medium';
    }

    // Undercut analysis using actual part data
    const hasUndercuts = params.hasUndercuts !== undefined ? params.hasUndercuts : context.undercuts;
    if (hasUndercuts) {
      risks.push('Undercuts detected in part geometry');
      recommendations.push('Consider redesigning to eliminate undercuts or use side actions');
      riskScore += 2;
      severity = Math.max(severity === 'high' ? 2 : 1, 1) === 2 ? 'high' : 'medium';
    }

    // Complexity analysis using actual part data
    const complexity = params.complexity !== undefined ? params.complexity : context.complexity;
    if (complexity > 0.8) {
      risks.push(`High geometric complexity (${(complexity * 100).toFixed(1)}%)`);
      recommendations.push('Simplify geometry where possible to improve manufacturability');
      riskScore += 2;
      severity = Math.max(severity === 'high' ? 2 : 1, 1) === 2 ? 'high' : 'medium';
    }

    // Sharp corner analysis
    if (context.features.sharpCorners && context.features.sharpCorners.length > 0) {
      risks.push(`${context.features.sharpCorners.length} sharp corners detected`);
      recommendations.push('Add fillets or chamfers to sharp corners');
      riskScore += 1;
      severity = Math.max(severity === 'high' ? 2 : 1, 1) === 2 ? 'high' : 'medium';
    }

    // Volume-based recommendations
    const volume = params.volume !== undefined ? params.volume : context.volume;
    if (volume < 1) {
      risks.push('Very small part volume may affect manufacturability');
      recommendations.push('Verify minimum manufacturable size with supplier');
      riskScore += 1;
    } else if (volume > 1000) {
      risks.push('Large part volume may require special handling');
      recommendations.push('Consider design for assembly to reduce part size');
      riskScore += 1;
    }

    // Material-specific recommendations
    const material = params.material?.toLowerCase() || '';
    if (material.includes('metal')) {
      if (minWallThickness < 0.8) {
        risks.push('Wall thickness below minimum for metal manufacturing');
        recommendations.push('Increase minimum wall thickness to at least 0.8mm for metals');
        riskScore += 1;
      }
    } else if (material.includes('plastic')) {
      if (complexity > 0.7) {
        risks.push('Complex plastic part may have flow issues during molding');
        recommendations.push('Optimize part design for plastic flow during molding');
        riskScore += 1;
      }
    }

    // Process-specific recommendations
    const process = params.process?.toLowerCase() || '';
    if (process.includes('injection')) {
      if (!recommendations.some(r => r.includes('gate'))) {
        recommendations.push('Consider gate location and runner design');
      }
    } else if (process.includes('casting')) {
      if (!recommendations.some(r => r.includes('draft'))) {
        recommendations.push('Ensure adequate draft angles (min 2°) for casting');
      }
    }

    // Add default recommendations if none found
    if (recommendations.length === 0) {
      recommendations.push('No major DFM issues detected');
      recommendations.push('Follow standard manufacturing guidelines');
    }

    // Calculate manufacturability score (0-1)
    const maxRiskScore = 10;
    const manufacturabilityScore = Math.max(0, Math.min(1, 1 - (riskScore / maxRiskScore)));

    logger('DFM analysis completed:', { risks, severity, recommendations, manufacturabilityScore });

    return {
      risks,
      severity,
      recommendations,
      manufacturabilityScore
    };
  } catch (error) {
    logger('Error in DFM analysis:', error);
    return {
      risks: ['Error analyzing DFM risks'],
      severity: 'medium',
      recommendations: ['Please check part geometry and try again'],
      manufacturabilityScore: 0.5
    };
  }
}

export function analyzeDFMRisksPerFace(geometry: BufferGeometry): DFMFaceRisk[] {
  try {
    const position = geometry.attributes.position;
    if (!position || position.count < 3) return [];

    const risks: DFMFaceRisk[] = [];
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

      // Calculate edge lengths
      const edgeAB = new Vector3(bx - ax, by - ay, bz - az).length();
      const edgeAC = new Vector3(cx - ax, cy - ay, cz - az).length();
      const edgeBC = new Vector3(cx - bx, cy - by, cz - bz).length();

      // Skip degenerate triangles
      if (edgeAB < 0.05 || edgeAC < 0.05 || edgeBC < 0.05) continue;

      const averageEdge = (edgeAB + edgeAC + edgeBC) / 3;

      // Detect thin walls
      if (averageEdge < 0.5) {
        const normalizedRisk = 1 - averageEdge / 0.5; // if edge is 0.1 → 0.8
        risks.push({
          faceIndex: i / 3,
          type: "thin_wall",
          severity: 0.8,
          riskScore: Math.min(1, normalizedRisk)
        });
      }

      // Detect undercuts
      const normal = new Vector3();
      const ab = new Vector3(bx - ax, by - ay, bz - az);
      const ac = new Vector3(cx - ax, cy - ay, cz - az);
      normal.crossVectors(ab, ac).normalize();

      // Use Z-axis as pull direction
      const pullVector = new Vector3(0, 0, 1);
      const verticalAngle = Math.abs(normal.dot(pullVector));
      if (verticalAngle < 0.1) { // Less than ~6 degrees from vertical
        const normalizedRisk = 1 - (verticalAngle / 0.1); // More vertical = higher risk
        risks.push({
          faceIndex: i / 3,
          type: "undercut",
          severity: 0.7,
          riskScore: Math.min(1, normalizedRisk)
        });
      }

      // Detect sharp corners
      const angle = ab.angleTo(ac) * (180 / Math.PI);
      if (angle < 30) {
        const normalizedRisk = (30 - angle) / 30; // angle 10° → 0.66
        risks.push({
          faceIndex: i / 3,
          type: "sharp_corner",
          severity: 0.6,
          riskScore: Math.min(1, normalizedRisk)
        });
      }
    }

    return risks;
  } catch (error) {
    logger('Error analyzing DFM risks per face:', error);
    return [];
  }
}