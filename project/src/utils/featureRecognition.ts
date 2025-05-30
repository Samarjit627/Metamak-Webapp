import { BufferGeometry, Vector3, Box3 } from 'three';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:featureRecognition');

export interface FeatureAnalysisResult {
  minWallThickness: number;
  maxDraftAngle: number;
  hasUndercuts: boolean;
  sharpCorners: { faceIndices: number[], angle: number, position: Vector3 }[];
  thinWalls: { position: Vector3; thickness: number; faceIndex: number }[];
  holes: { position: Vector3; diameter: number }[];
  ribs: { position: Vector3; height: number; thickness: number }[];
  bosses: { position: Vector3; diameter: number; height: number }[];
  fillets: { position: Vector3; radius: number }[];
  chamfers: { position: Vector3; angle: number; depth: number }[];
  undercuts: { position: Vector3; angle: number; faceIndex: number }[];
  complexity: number;
}

// Maximum number of features to report per category
const MAX_FEATURES_PER_CATEGORY = 5;

export async function analyzeFeatures(geometry: BufferGeometry, pullDirection?: Vector3): Promise<FeatureAnalysisResult> {
  try {
    logger('Starting feature analysis');
    logger('Geometry info:', {
      hasPosition: !!geometry.attributes?.position,
      vertexCount: geometry.attributes?.position?.count || 0,
      hasBoundingBox: !!geometry.boundingBox
    });

    // Ensure geometry is valid
    if (!geometry.attributes.position) {
      logger('Invalid geometry: missing position attribute');
      throw new Error('Invalid geometry: missing position attribute');
    }

    // Initialize result with default values
    const result: FeatureAnalysisResult = {
      minWallThickness: 2.0, // Default value
      maxDraftAngle: 0,
      hasUndercuts: false,
      sharpCorners: [],
      thinWalls: [],
      holes: [],
      ribs: [],
      bosses: [],
      fillets: [],
      chamfers: [],
      undercuts: [],
      complexity: 0.5 // Default medium complexity
    };

    // Get geometry attributes
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal || null;
    const vertexCount = positions.count;

    logger(`Processing ${vertexCount} vertices`);

    if (vertexCount < 3) {
      logger('Not enough vertices for analysis');
      return result;
    }

    // Compute bounding box if not already computed
    if (!geometry.boundingBox) {
      logger('Computing bounding box');
      geometry.computeBoundingBox();
    }

    // Get geometry dimensions
    const box = geometry.boundingBox!;
    const size = new Vector3();
    box.getSize(size);
    
    logger('Geometry dimensions:', {
      width: size.x,
      height: size.y,
      depth: size.z
    });
    
    // Temporary arrays to collect all features before filtering
    const allThinWalls: { position: Vector3; thickness: number; faceIndex: number }[] = [];
    const allSharpCorners: { position: Vector3; angle: number; faceIndex: number }[] = [];
    const allHoles: { position: Vector3; diameter: number }[] = [];
    const allUndercuts: { position: Vector3; angle: number; faceIndex: number }[] = [];
    
    // For debugging: force full face scan and lower sharp corner threshold
    const sampleStep = 1; // Analyze every face
    const sharpCornerAngleThreshold = 80; // Moderately permissive, highlights more

    // Sample a subset of faces for large models
    const maxFacesToAnalyze = 10000; // Limit analysis to 10,000 faces for performance
    const faceCount = Math.floor(vertexCount / 3);
    
    // Use provided pull direction or default to Z-axis
    const pullVector = pullDirection ? pullDirection.clone().normalize() : new Vector3(0, 0, 1);
    
    // --- BUILD FACE ADJACENCY MAP ---
    // Map: faceIdx -> Set of adjacent face indices
    const faceAdjacency: Map<number, Set<number>> = new Map();
    // Build a vertex-to-face map
    const vertexToFaces: Map<string, Set<number>> = new Map();
    for (let i = 0; i < vertexCount; i += 3) {
      const faceIdx = Math.floor(i / 3);
      for (let j = 0; j < 3; j++) {
        const v = new Vector3().fromBufferAttribute(positions, i + j);
        const key = `${v.x.toFixed(6)},${v.y.toFixed(6)},${v.z.toFixed(6)}`;
        if (!vertexToFaces.has(key)) vertexToFaces.set(key, new Set());
        vertexToFaces.get(key)!.add(faceIdx);
      }
    }
    // For each face, find neighbors (sharing 2 vertices)
    for (let i = 0; i < vertexCount; i += 3) {
      const faceIdx = Math.floor(i / 3);
      const neighborCounts: Map<number, number> = new Map();
      for (let j = 0; j < 3; j++) {
        const v = new Vector3().fromBufferAttribute(positions, i + j);
        const key = `${v.x.toFixed(6)},${v.y.toFixed(6)},${v.z.toFixed(6)}`;
        for (const nbr of vertexToFaces.get(key)!) {
          if (nbr !== faceIdx) {
            neighborCounts.set(nbr, (neighborCounts.get(nbr) || 0) + 1);
          }
        }
      }
      // Add neighbors sharing at least 2 vertices
      for (const [nbr, count] of neighborCounts.entries()) {
        if (count >= 2) {
          if (!faceAdjacency.has(faceIdx)) faceAdjacency.set(faceIdx, new Set());
          faceAdjacency.get(faceIdx)!.add(nbr);
        }
      }
    }

    for (let i = 0; i < vertexCount; i += 3 * sampleStep) {
      try {
        if (i + 2 >= vertexCount) continue;
        
        const faceIdx = Math.floor(i / 3);
        const v1 = new Vector3().fromBufferAttribute(positions, i);
        const v2 = new Vector3().fromBufferAttribute(positions, i + 1);
        const v3 = new Vector3().fromBufferAttribute(positions, i + 2);

        // Skip degenerate triangles
        const edge1 = new Vector3().subVectors(v2, v1);
        const edge2 = new Vector3().subVectors(v3, v2);
        const edge3 = new Vector3().subVectors(v1, v3);
        
        if (edge1.length() < 0.05 || edge2.length() < 0.05 || edge3.length() < 0.05) continue;

        // Calculate face normal
        let normal;
        if (normals) {
          normal = new Vector3().fromBufferAttribute(normals, i);
        } else {
          // Calculate normal if not provided
          normal = new Vector3().crossVectors(edge1, edge2).normalize();
        }

        // Calculate face area and perimeter
        const area = new Vector3()
          .crossVectors(edge1, edge2)
          .length() * 0.5;
        
        const perimeter = edge1.length() + edge2.length() + edge3.length();

        // Estimate thickness using area/perimeter ratio
        if (perimeter > 0) {
          const thickness = (2 * area) / perimeter;
          if (thickness < result.minWallThickness) {
            result.minWallThickness = thickness;
          }

          // Check for thin walls
          if (thickness < 2.0) {
            allThinWalls.push({
              position: v1.clone().add(v2).add(v3).multiplyScalar(1/3),
              thickness,
              faceIndex: faceIdx
            });
          }
        }

        // Analyze draft angles
        const angle = Math.acos(Math.abs(normal.dot(pullVector))) * (180 / Math.PI);
        result.maxDraftAngle = Math.max(result.maxDraftAngle, angle);

        // Check for undercuts
        if (normal.dot(pullVector) < -0.1) {
          result.hasUndercuts = true;
          allUndercuts.push({
            position: v1.clone().add(v2).add(v3).multiplyScalar(1/3),
            angle: Math.acos(normal.dot(pullVector)) * (180 / Math.PI),
            faceIndex: faceIdx
          });
        }

        // Detect sharp corners
        const edges = [edge1, edge2, edge3];
        edges.forEach((edge, idx) => {
          const nextEdge = edges[(idx + 1) % 3];
          if (edge.length() > 0 && nextEdge.length() > 0) {
            const angle = edge.angleTo(nextEdge) * (180 / Math.PI);
            
            if (angle < sharpCornerAngleThreshold) {
              allSharpCorners.push({
                position: [v1, v2, v3][idx].clone(),
                angle,
                faceIndex: faceIdx
              });
            }
          }
        });
        
        // Detect potential holes (circular patterns)
        detectCircularFeatures(v1, v2, v3, allHoles);
      } catch (error) {
        logger('Error processing face:', error);
        // Continue with next face
      }
    }

    logger('Feature counts before filtering:', {
      thinWalls: allThinWalls.length,
      sharpCorners: allSharpCorners.length,
      undercuts: allUndercuts.length,
      holes: allHoles.length
    });

    // Filter and sort features to keep only the most significant ones
    
    // Sort thin walls by thickness (ascending) and take the thinnest ones
    allThinWalls.sort((a, b) => a.thickness - b.thickness);
    result.thinWalls = allThinWalls.slice(0, MAX_FEATURES_PER_CATEGORY);
    
    // Group sharp corners into regions of connected faces
    const sharpCornerFaceSet = new Set(allSharpCorners.map(sc => sc.faceIndex));
    const visitedSharp = new Set<number>();
    const sharpCornerRegions: { faceIndices: number[], angle: number, position: Vector3 }[] = [];
    for (const sc of allSharpCorners) {
      if (!visitedSharp.has(sc.faceIndex)) {
        // Flood fill to collect all connected sharp corner faces
        const regionFaces = collectRegionFaces(
          sc.faceIndex,
          faceCount,
          idx => sharpCornerFaceSet.has(idx),
          idx => Array.from(faceAdjacency.get(idx) || [])
        );
        regionFaces.forEach(f => visitedSharp.add(f));
        sharpCornerRegions.push({ faceIndices: regionFaces, angle: sc.angle, position: sc.position });
      }
    }
    logger('Sharp corner seeds:', allSharpCorners.length);
    logger('Sharp corner regions:', sharpCornerRegions.map(r => r.faceIndices.length));
    logger('DFM region summary:', {
      sharpCorners: sharpCornerRegions.reduce((sum, r) => sum + r.faceIndices.length, 0),
      thinWalls: result.thinWalls ? result.thinWalls.length : 0,
      undercuts: result.undercuts ? result.undercuts.length : 0
    });
    result.sharpCorners = sharpCornerRegions;
    
    // Sort undercuts by angle (descending) and take the largest (most negative)
    allUndercuts.sort((a, b) => a.angle - b.angle);
    result.undercuts = allUndercuts.slice(0, MAX_FEATURES_PER_CATEGORY);
    
    // Sort holes by diameter and take a representative sample
    allHoles.sort((a, b) => a.diameter - b.diameter);
    // Take smallest, largest, and some in between
    if (allHoles.length > MAX_FEATURES_PER_CATEGORY) {
      const step = Math.max(1, Math.floor(allHoles.length / MAX_FEATURES_PER_CATEGORY));
      result.holes = [];
      for (let i = 0; i < allHoles.length && result.holes.length < MAX_FEATURES_PER_CATEGORY; i += step) {
        result.holes.push(allHoles[i]);
      }
    } else {
      result.holes = allHoles;
    }

    // Detect ribs, bosses, fillets, and chamfers
    detectAdvancedFeatures(geometry, result, size);

    // Filter advanced features
    result.ribs = result.ribs.slice(0, MAX_FEATURES_PER_CATEGORY);
    result.bosses = result.bosses.slice(0, MAX_FEATURES_PER_CATEGORY);
    result.fillets = result.fillets.slice(0, MAX_FEATURES_PER_CATEGORY);
    result.chamfers = result.chamfers.slice(0, MAX_FEATURES_PER_CATEGORY);

    // If no thin walls were detected, set a reasonable default
    if (result.minWallThickness === Infinity) {
      result.minWallThickness = 2.0;
    }

    // Calculate complexity based on feature counts and geometry
    result.complexity = calculateComplexity(result, geometry);
    logger('Calculated complexity:', result.complexity);

    logger('Feature analysis completed successfully');
    logger('Final feature counts after filtering:', {
      thinWalls: result.thinWalls.length,
      sharpCorners: result.sharpCorners.length,
      holes: result.holes.length,
      ribs: result.ribs.length,
      bosses: result.bosses.length,
      fillets: result.fillets.length,
      chamfers: result.chamfers.length
    });
    
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in feature analysis:', errorMsg);
    
    // Return safe default values
    return {
      minWallThickness: 2.0,
      maxDraftAngle: 0,
      hasUndercuts: false,
      sharpCorners: [],
      thinWalls: [],
      holes: [],
      ribs: [],
      bosses: [],
      fillets: [],
      chamfers: [],
      undercuts: [],
      complexity: 0.5
    };
  }
}

// --- REGION GROWING UTILITY ---
/**
 * Collect all connected faces in a region that satisfy a predicate.
 * @param faceIdx Seed face index
 * @param faceCount Total number of faces
 * @param isInRegion (faceIdx: number) => boolean
 * @param getAdjacentFaces (faceIdx: number) => number[]
 */
function collectRegionFaces(faceIdx: number, faceCount: number, isInRegion: (idx: number) => boolean, getAdjacentFaces: (idx: number) => number[]): number[] {
  const region = new Set<number>();
  const queue = [faceIdx];
  while (queue.length > 0) {
    const idx = queue.pop()!;
    if (!region.has(idx) && isInRegion(idx)) {
      region.add(idx);
      for (const adj of getAdjacentFaces(idx)) {
        if (!region.has(adj) && isInRegion(adj)) {
          queue.push(adj);
        }
      }
    }
  }
  return Array.from(region);
}

function detectCircularFeatures(v1: Vector3, v2: Vector3, v3: Vector3, holes: { position: Vector3; diameter: number }[]) {
  try {
    // Calculate center of the triangle
    const center = v1.clone().add(v2).add(v3).multiplyScalar(1/3);
    
    // Calculate distances from center to each vertex
    const r1 = v1.distanceTo(center);
    const r2 = v2.distanceTo(center);
    const r3 = v3.distanceTo(center);
    
    // Calculate average radius and variation
    const avgRadius = (r1 + r2 + r3) / 3;
    const variation = Math.max(Math.abs(r1 - avgRadius), Math.abs(r2 - avgRadius), Math.abs(r3 - avgRadius));
    
    // If variation is small, it might be part of a circular feature
    if (variation / avgRadius < 0.1) {
      // Check if this is a new hole (not too close to existing ones)
      const isNewHole = !holes.some(hole => 
        hole.position.distanceTo(center) < avgRadius * 1.5
      );
      
      if (isNewHole) {
        holes.push({
          position: center,
          diameter: avgRadius * 2
        });
      }
    }
  } catch (error) {
    logger('Error detecting circular features:', error);
  }
}

function detectAdvancedFeatures(geometry: BufferGeometry, result: FeatureAnalysisResult, size: Vector3) {
  try {
    // Compute bounding box if not already computed
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    
    const box = geometry.boundingBox!;
    
    // Detect ribs (long, thin vertical features)
    const minRibHeight = size.y * 0.1;
    const minRibLength = size.x * 0.2;
    
    // Detect bosses (cylindrical protrusions)
    const positions = geometry.attributes.position;
    
    // Sample vertices to find potential cylindrical features
    const sampleSize = Math.min(positions.count, 1000);
    const step = Math.max(1, Math.floor(positions.count / sampleSize));
    
    // Temporary arrays to collect features before filtering
    const allRibs: { position: Vector3; height: number; thickness: number }[] = [];
    const allBosses: { position: Vector3; diameter: number; height: number }[] = [];
    const allFillets: { position: Vector3; radius: number }[] = [];
    const allChamfers: { position: Vector3; angle: number; depth: number }[] = [];
    
    for (let i = 0; i < positions.count; i += step) {
      const vertex = new Vector3().fromBufferAttribute(positions, i);
      
      // Check if this vertex is part of a potential boss
      // (A simple heuristic: vertices that are higher than average and form circular patterns)
      if (vertex.y > (box.min.y + box.max.y) / 2) {
        const potentialBoss = isPotentialBoss(vertex, positions, box);
        if (potentialBoss) {
          allBosses.push(potentialBoss);
        }
      }
      
      // Check for potential fillets (smooth transitions between surfaces)
      const potentialFillet = isPotentialFillet(vertex, positions, step);
      if (potentialFillet) {
        allFillets.push(potentialFillet);
      }
      
      // Check for potential chamfers (angled transitions)
      const potentialChamfer = isPotentialChamfer(vertex, positions, step);
      if (potentialChamfer) {
        allChamfers.push(potentialChamfer);
      }
    }
    
    // Detect ribs by looking for thin, tall features
    for (let i = 0; i < positions.count; i += 3 * step) {
      try {
        if (i + 2 >= positions.count) continue;
        
        const v1 = new Vector3().fromBufferAttribute(positions, i);
        const v2 = new Vector3().fromBufferAttribute(positions, i + 1);
        const v3 = new Vector3().fromBufferAttribute(positions, i + 2);

        // Calculate height and width
        const height = Math.max(
          Math.abs(v1.y - v2.y),
          Math.abs(v2.y - v3.y),
          Math.abs(v3.y - v1.y)
        );
        
        const width = Math.min(
          Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.z - v2.z, 2)),
          Math.sqrt(Math.pow(v2.x - v3.x, 2) + Math.pow(v2.z - v3.z, 2)),
          Math.sqrt(Math.pow(v3.x - v1.x, 2) + Math.pow(v3.z - v1.z, 2))
        );
        
        if (height > minRibHeight && width < height * 0.3) {
          // Check if this is a new rib (not too close to existing ones)
          const center = v1.clone().add(v2).add(v3).multiplyScalar(1/3);
          const isNewRib = !allRibs.some(rib => 
            rib.position.distanceTo(center) < height * 0.5
          );
          
          if (isNewRib) {
            allRibs.push({
              position: center,
              height,
              thickness: width
            });
          }
        }
      } catch (error) {
        logger('Error detecting rib:', error);
      }
    }
    
    // Filter and sort advanced features
    
    // Sort ribs by height-to-thickness ratio (descending) and take top ones
    allRibs.sort((a, b) => (b.height / b.thickness) - (a.height / a.thickness));
    result.ribs = allRibs.slice(0, MAX_FEATURES_PER_CATEGORY);
    
    // Sort bosses by diameter (descending) and take top ones
    allBosses.sort((a, b) => b.diameter - a.diameter);
    result.bosses = allBosses.slice(0, MAX_FEATURES_PER_CATEGORY);
    
    // Sort fillets by radius (ascending) and take smallest ones
    allFillets.sort((a, b) => a.radius - b.radius);
    result.fillets = allFillets.slice(0, MAX_FEATURES_PER_CATEGORY);
    
    // Sort chamfers by angle (ascending) and take sharpest ones
    allChamfers.sort((a, b) => a.angle - b.angle);
    result.chamfers = allChamfers.slice(0, MAX_FEATURES_PER_CATEGORY);
    
  } catch (error) {
    logger('Error detecting advanced features:', error);
  }
}

function isPotentialBoss(vertex: Vector3, positions: any, box: Box3): { position: Vector3; diameter: number; height: number } | null {
  try {
    // Sample nearby vertices to check for circular pattern
    const center = new Vector3(vertex.x, vertex.y, vertex.z);
    const radius = box.max.distanceTo(box.min) * 0.05; // 5% of bounding box diagonal as search radius
    const height = vertex.y - box.min.y;
    
    let circularPoints = 0;
    let totalPoints = 0;
    
    // Sample random vertices to check if they form a circular pattern
    for (let i = 0; i < positions.count; i += Math.max(1, Math.floor(positions.count / 100))) {
      const testVertex = new Vector3().fromBufferAttribute(positions, i);
      
      // Check if vertex is at similar height
      if (Math.abs(testVertex.y - vertex.y) < height * 0.1) {
        const horizontalDist = Math.sqrt(
          Math.pow(testVertex.x - center.x, 2) + 
          Math.pow(testVertex.z - center.z, 2)
        );
        
        if (horizontalDist < radius * 1.2 && horizontalDist > radius * 0.8) {
          circularPoints++;
        }
        
        if (horizontalDist < radius * 1.5) {
          totalPoints++;
        }
      }
    }
    
    // If at least 30% of nearby points form a circular pattern, it might be a boss
    if (totalPoints > 5 && circularPoints / totalPoints > 0.3) {
      return {
        position: center,
        diameter: radius * 2,
        height
      };
    }
    
    return null;
  } catch (error) {
    logger('Error detecting boss:', error);
    return null;
  }
}

function isPotentialFillet(vertex: Vector3, positions: any, step: number): { position: Vector3; radius: number } | null {
  try {
    // Sample nearby vertices to check for smooth curvature
    const nearbyVertices: Vector3[] = [];
    
    for (let i = 0; i < positions.count; i += step) {
      const testVertex = new Vector3().fromBufferAttribute(positions, i);
      if (testVertex.distanceTo(vertex) < 0.5) {
        nearbyVertices.push(testVertex);
      }
      
      if (nearbyVertices.length >= 10) break;
    }
    
    if (nearbyVertices.length < 5) return null;
    
    // Calculate average curvature
    let totalAngle = 0;
    let angleCount = 0;
    
    for (let i = 0; i < nearbyVertices.length - 2; i++) {
      const v1 = nearbyVertices[i];
      const v2 = nearbyVertices[i + 1];
      const v3 = nearbyVertices[i + 2];
      
      const edge1 = v2.clone().sub(v1);
      const edge2 = v3.clone().sub(v2);
      
      if (edge1.length() > 0 && edge2.length() > 0) {
        const angle = edge1.angleTo(edge2) * (180 / Math.PI);
        totalAngle += angle;
        angleCount++;
      }
    }
    
    if (angleCount === 0) return null;
    
    const avgAngle = totalAngle / angleCount;
    
    // If average angle is between 160-180 degrees, it might be a fillet
    if (avgAngle > 160 && avgAngle < 180) {
      // Estimate radius based on vertex density
      const radius = nearbyVertices.reduce((sum, v) => sum + v.distanceTo(vertex), 0) / nearbyVertices.length;
      
      return {
        position: vertex.clone(),
        radius
      };
    }
    
    return null;
  } catch (error) {
    logger('Error detecting fillet:', error);
    return null;
  }
}

function isPotentialChamfer(vertex: Vector3, positions: any, step: number): { position: Vector3; angle: number; depth: number } | null {
  try {
    // Sample nearby vertices to check for angled transition
    const nearbyVertices: Vector3[] = [];
    
    for (let i = 0; i < positions.count; i += step) {
      const testVertex = new Vector3().fromBufferAttribute(positions, i);
      if (testVertex.distanceTo(vertex) < 0.5) {
        nearbyVertices.push(testVertex);
      }
      
      if (nearbyVertices.length >= 10) break;
    }
    
    if (nearbyVertices.length < 5) return null;
    
    // Calculate average angle
    let totalAngle = 0;
    let angleCount = 0;
    
    for (let i = 0; i < nearbyVertices.length - 2; i++) {
      const v1 = nearbyVertices[i];
      const v2 = nearbyVertices[i + 1];
      const v3 = nearbyVertices[i + 2];
      
      const edge1 = v2.clone().sub(v1);
      const edge2 = v3.clone().sub(v2);
      
      if (edge1.length() > 0 && edge2.length() > 0) {
        const angle = edge1.angleTo(edge2) * (180 / Math.PI);
        totalAngle += angle;
        angleCount++;
      }
    }
    
    if (angleCount === 0) return null;
    
    const avgAngle = totalAngle / angleCount;
    
    // If average angle is around 135 degrees (45 degree chamfer), it might be a chamfer
    if (avgAngle > 130 && avgAngle < 140) {
      // Estimate depth based on vertex density
      const depth = nearbyVertices.reduce((sum, v) => sum + v.distanceTo(vertex), 0) / nearbyVertices.length;
      
      return {
        position: vertex.clone(),
        angle: 45, // Assuming 45-degree chamfer
        depth
      };
    }
    
    return null;
  } catch (error) {
    logger('Error detecting chamfer:', error);
    return null;
  }
}

function calculateComplexity(result: FeatureAnalysisResult, geometry: BufferGeometry): number {
  try {
    // Calculate complexity based on feature counts
    const featureCount = 
      result.thinWalls.length + 
      (result.hasUndercuts ? 1 : 0) + 
      result.ribs.length + 
      result.holes.length;
    
    // Get face count
    const faceCount = geometry.attributes.position.count / 3;
    
    // Calculate complexity as ratio of features to faces (normalized)
    let complexity = featureCount / (faceCount / 1000);
    
    // Cap at 100%
    complexity = Math.min(complexity, 1.0);
    
    return complexity;
  } catch (error) {
    logger('Error calculating complexity:', error);
    return 0.5; // Default medium complexity
  }
}