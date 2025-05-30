import DxfParser from 'dxf-parser';
import * as makerjs from 'makerjs';
import * as THREE from 'three';
import { BufferGeometry, Vector3, Vector2 } from 'three';

interface DxfEntity {
  type: string;
  vertices?: { x: number; y: number; z: number }[];
  center?: { x: number; y: number; z: number };
  radius?: number;
  startPoint?: { x: number; y: number; z: number };
  endPoint?: { x: number; y: number; z: number };
  bulge?: number;
  points?: { x: number; y: number; z: number }[];
  position?: { x: number; y: number; z: number };
  extrusionDirection?: { x: number; y: number; z: number };
  startAngle?: number;
  endAngle?: number;
  controlPoints?: { x: number; y: number; z: number }[];
  text?: string;
  textHeight?: number;
  rotation?: number;
  style?: string;
}

interface DimensionLine {
  start: Vector2;
  end: Vector2;
  text: string;
  arrows: Vector2[];
}

interface DxfData {
  entities: DxfEntity[];
  header?: any;
  tables?: any;
  blocks?: any;
}

export async function loadDXFFile(file: File): Promise<{
  geometry: BufferGeometry;
  entities: DxfEntity[];
  boundingBox: { width: number; height: number; depth: number };
  dimensions: DimensionLine[];
}> {
  try {
    const text = await file.text();
    const parser = new DxfParser();
    const dxfData = parser.parseSync(text) as DxfData;
    
    // Create a geometry from the DXF data
    const geometry = createGeometryFromDXF(dxfData);
    
    // Calculate bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new Vector3();
    box.getSize(size);

    // Extract dimension lines and arrows
    const dimensions = extractDimensions(dxfData.entities);
    
    return {
      geometry,
      entities: dxfData.entities,
      boundingBox: {
        width: size.x,
        height: size.y,
        depth: size.z || 1
      },
      dimensions
    };
  } catch (error) {
    console.error('Error loading DXF file:', error);
    throw new Error('Failed to parse DXF file');
  }
}

function extractDimensions(entities: DxfEntity[]): DimensionLine[] {
  const dimensions: DimensionLine[] = [];
  const dimensionEntities = entities.filter(e => 
    e.type === 'DIMENSION' || 
    (e.type === 'LINE' && isDimensionLine(e, entities))
  );

  for (const entity of dimensionEntities) {
    if (entity.type === 'DIMENSION') {
      // Handle explicit dimension entities
      if (entity.startPoint && entity.endPoint) {
        const start = new Vector2(entity.startPoint.x, entity.startPoint.y);
        const end = new Vector2(entity.endPoint.x, entity.endPoint.y);
        
        // Find associated text entity
        const text = findAssociatedText(entity, entities);
        
        // Generate arrow points
        const arrows = generateArrowPoints(start, end);
        
        dimensions.push({
          start,
          end,
          text: text || '',
          arrows
        });
      }
    } else if (entity.type === 'LINE') {
      // Handle dimension lines identified by pattern
      const associatedText = findNearestText(entity, entities);
      if (associatedText && entity.vertices) {
        const start = new Vector2(entity.vertices[0].x, entity.vertices[0].y);
        const end = new Vector2(entity.vertices[1].x, entity.vertices[1].y);
        const arrows = generateArrowPoints(start, end);
        
        dimensions.push({
          start,
          end,
          text: associatedText,
          arrows
        });
      }
    }
  }

  return dimensions;
}

function isDimensionLine(line: DxfEntity, entities: DxfEntity[]): boolean {
  if (!line.vertices || line.vertices.length < 2) return false;

  const start = new Vector2(line.vertices[0].x, line.vertices[0].y);
  const end = new Vector2(line.vertices[1].x, line.vertices[1].y);
  
  // Check if there's text near the line
  const hasNearbyText = entities.some(e => {
    if (e.type !== 'TEXT' || !e.position) return false;
    
    const textPos = new Vector2(e.position.x, e.position.y);
    const lineMid = start.clone().add(end).multiplyScalar(0.5);
    
    return textPos.distanceTo(lineMid) < (end.distanceTo(start) * 0.2);
  });

  // Check if there are perpendicular extension lines
  const hasExtensionLines = entities.some(e => {
    if (e.type !== 'LINE' || !e.vertices || e.vertices.length < 2) return false;
    
    const extLine = new Vector2()
      .subVectors(
        new Vector2(e.vertices[1].x, e.vertices[1].y),
        new Vector2(e.vertices[0].x, e.vertices[0].y)
      )
      .normalize();
    
    const dimLine = new Vector2()
      .subVectors(end, start)
      .normalize();
    
    // Check if lines are perpendicular (dot product close to 0)
    return Math.abs(extLine.dot(dimLine)) < 0.1;
  });

  return hasNearbyText && hasExtensionLines;
}

function findAssociatedText(dimension: DxfEntity, entities: DxfEntity[]): string | null {
  if (!dimension.startPoint || !dimension.endPoint) return null;

  const midPoint = new Vector2(
    (dimension.startPoint.x + dimension.endPoint.x) / 2,
    (dimension.startPoint.y + dimension.endPoint.y) / 2
  );

  let nearestText: string | null = null;
  let minDistance = Infinity;

  for (const entity of entities) {
    if (entity.type === 'TEXT' && entity.text && entity.position) {
      const textPos = new Vector2(entity.position.x, entity.position.y);
      const distance = textPos.distanceTo(midPoint);

      if (distance < minDistance) {
        minDistance = distance;
        nearestText = entity.text;
      }
    }
  }

  return nearestText;
}

function findNearestText(line: DxfEntity, entities: DxfEntity[]): string | null {
  if (!line.vertices || line.vertices.length < 2) return null;

  const start = new Vector2(line.vertices[0].x, line.vertices[0].y);
  const end = new Vector2(line.vertices[1].x, line.vertices[1].y);
  const midPoint = start.clone().add(end).multiplyScalar(0.5);

  let nearestText: string | null = null;
  let minDistance = Infinity;

  for (const entity of entities) {
    if (entity.type === 'TEXT' && entity.text && entity.position) {
      const textPos = new Vector2(entity.position.x, entity.position.y);
      const distance = textPos.distanceTo(midPoint);

      // Only consider text within a reasonable distance
      if (distance < end.distanceTo(start) * 0.2 && distance < minDistance) {
        minDistance = distance;
        nearestText = entity.text;
      }
    }
  }

  return nearestText;
}

function generateArrowPoints(start: Vector2, end: Vector2): Vector2[] {
  const arrowLength = end.distanceTo(start) * 0.1; // 10% of line length
  const arrowWidth = arrowLength * 0.5;

  const direction = end.clone().sub(start).normalize();
  const perpendicular = new Vector2(-direction.y, direction.x);

  // Generate arrow points for both ends
  const startArrow = [
    start.clone(),
    start.clone().add(direction.clone().multiplyScalar(arrowLength))
      .add(perpendicular.clone().multiplyScalar(arrowWidth)),
    start.clone().add(direction.clone().multiplyScalar(arrowLength))
      .add(perpendicular.clone().multiplyScalar(-arrowWidth))
  ];

  const endArrow = [
    end.clone(),
    end.clone().sub(direction.clone().multiplyScalar(arrowLength))
      .add(perpendicular.clone().multiplyScalar(arrowWidth)),
    end.clone().sub(direction.clone().multiplyScalar(arrowLength))
      .add(perpendicular.clone().multiplyScalar(-arrowWidth))
  ];

  return [...startArrow, ...endArrow];
}

function createGeometryFromDXF(dxfData: DxfData): BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  // Process each entity in the DXF file
  dxfData.entities.forEach(entity => {
    switch (entity.type.toLowerCase()) {
      case 'line':
        if (entity.vertices && entity.vertices.length >= 2) {
          vertices.push(
            entity.vertices[0].x, entity.vertices[0].y, 0,
            entity.vertices[1].x, entity.vertices[1].y, 0
          );
          indices.push(vertexIndex, vertexIndex + 1);
          vertexIndex += 2;
        }
        break;

      case 'polyline':
      case 'lwpolyline':
        if (entity.vertices && entity.vertices.length > 1) {
          const startIndex = vertexIndex;
          entity.vertices.forEach(vertex => {
            vertices.push(vertex.x, vertex.y, 0);
            vertexIndex++;
          });
          
          for (let i = 0; i < entity.vertices.length - 1; i++) {
            indices.push(startIndex + i, startIndex + i + 1);
          }
          
          // Close the polyline if it's a closed loop
          if (entity.vertices[0].x === entity.vertices[entity.vertices.length - 1].x &&
              entity.vertices[0].y === entity.vertices[entity.vertices.length - 1].y) {
            indices.push(startIndex + entity.vertices.length - 1, startIndex);
          }
        }
        break;

      case 'circle':
        if (entity.center && entity.radius) {
          const segments = 32;
          const startIndex = vertexIndex;
          
          for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = entity.center.x + Math.cos(angle) * entity.radius;
            const y = entity.center.y + Math.sin(angle) * entity.radius;
            
            vertices.push(x, y, 0);
            vertexIndex++;
            
            if (i > 0) {
              indices.push(startIndex + i - 1, startIndex + i);
            }
          }
          indices.push(startIndex + segments, startIndex);
        }
        break;

      case 'arc':
        if (entity.center && entity.radius && 
            typeof entity.startAngle === 'number' && 
            typeof entity.endAngle === 'number') {
          const segments = 32;
          const startIndex = vertexIndex;
          const startAngle = (entity.startAngle * Math.PI) / 180;
          const endAngle = (entity.endAngle * Math.PI) / 180;
          
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const angle = startAngle + (endAngle - startAngle) * t;
            const x = entity.center.x + Math.cos(angle) * entity.radius;
            const y = entity.center.y + Math.sin(angle) * entity.radius;
            
            vertices.push(x, y, 0);
            vertexIndex++;
            
            if (i > 0) {
              indices.push(startIndex + i - 1, startIndex + i);
            }
          }
        }
        break;
    }
  });

  // Create the geometry
  const geometry = new THREE.BufferGeometry();
  
  // Add position attribute
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  // Add indices
  if (indices.length > 0) {
    geometry.setIndex(indices);
  }
  
  // Compute vertex normals
  geometry.computeVertexNormals();
  
  // Center the geometry
  geometry.center();
  
  return geometry;
}

function interpolateSpline(points: { x: number; y: number; z?: number }[], t: number) {
  const n = points.length - 1;
  let x = 0, y = 0, z = 0;
  
  for (let i = 0; i <= n; i++) {
    const b = bernstein(n, i, t);
    x += points[i].x * b;
    y += points[i].y * b;
    z += (points[i].z || 0) * b;
  }
  
  return { x, y, z };
}

function bernstein(n: number, i: number, t: number): number {
  return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

function binomial(n: number, k: number): number {
  let coeff = 1;
  for (let i = n - k + 1; i <= n; i++) coeff *= i;
  for (let i = 1; i <= k; i++) coeff /= i;
  return coeff;
}

export function analyzeDXFComplexity(entities: DxfEntity[]): number {
  let complexityScore = 0;
  
  const entityCount = entities.length;
  complexityScore += Math.min(entityCount / 100, 1) * 0.3;
  
  let hasCircles = false;
  let hasArcs = false;
  let hasSplines = false;
  let hasPolylines = false;
  let entityTypeVariety = 0;
  
  entities.forEach(entity => {
    switch (entity.type) {
      case 'CIRCLE':
        hasCircles = true;
        break;
      case 'ARC':
        hasArcs = true;
        break;
      case 'SPLINE':
        hasSplines = true;
        break;
      case 'POLYLINE':
      case 'LWPOLYLINE':
        hasPolylines = true;
        break;
    }
  });
  
  entityTypeVariety = (hasCircles ? 1 : 0) + (hasArcs ? 1 : 0) + 
                      (hasSplines ? 1 : 0) + (hasPolylines ? 1 : 0);
  
  complexityScore += (entityTypeVariety / 4) * 0.2;
  
  if (hasSplines) complexityScore += 0.2;
  if (hasArcs) complexityScore += 0.1;
  
  complexityScore += Math.min(entityCount / 200, 1) * 0.2;
  
  return Math.max(0.1, Math.min(complexityScore, 1));
}

export function estimateDXFVolume(boundingBox: { width: number; height: number; depth: number }): number {
  const estimatedThickness = 10;
  
  const volume = (boundingBox.width * boundingBox.height * estimatedThickness) / 1000;
  
  return Math.max(volume, 1);
}

export function getDXFFeatures(entities: DxfEntity[]): {
  hasCircularFeatures: boolean;
  hasComplexCurves: boolean;
  hasTightTolerances: boolean;
  estimatedPartCount: number;
} {
  let circleCount = 0;
  let arcCount = 0;
  let splineCount = 0;
  let lineCount = 0;
  let polylineCount = 0;
  
  entities.forEach(entity => {
    switch (entity.type) {
      case 'CIRCLE':
        circleCount++;
        break;
      case 'ARC':
        arcCount++;
        break;
      case 'SPLINE':
        splineCount++;
        break;
      case 'LINE':
        lineCount++;
        break;
      case 'POLYLINE':
      case 'LWPOLYLINE':
        polylineCount++;
        break;
    }
  });
  
  const totalEntities = entities.length;
  const estimatedPartCount = Math.max(1, Math.ceil(totalEntities / 20));
  
  return {
    hasCircularFeatures: circleCount > 0 || arcCount > 0,
    hasComplexCurves: splineCount > 0,
    hasTightTolerances: totalEntities > 50,
    estimatedPartCount
  };
}