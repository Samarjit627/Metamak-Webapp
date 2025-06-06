import { BufferGeometry } from 'three';

/**
 * Serializes a Three.js BufferGeometry into a minimal JSON-compatible format
 * Only includes position (vertices) and index (faces) for DFM backend
 */
export function serializeGeometry(geometry: BufferGeometry) {
  if (!geometry || !geometry.attributes.position) {
    return null;
  }
  const positions = Array.from(geometry.attributes.position.array);
  let indices: number[] = [];
  if (geometry.index) {
    indices = Array.from(geometry.index.array);
  }
  return {
    positions,
    indices,
    // Optionally add normals, uvs, etc. if needed
  };
}

/**
 * Serializes an array of BufferGeometry objects (e.g., for selected parts)
 */
export function serializeGeometries(geometries: BufferGeometry[]) {
  return geometries.map(g => serializeGeometry(g));
}
