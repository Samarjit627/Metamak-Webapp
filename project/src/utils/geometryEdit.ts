import * as THREE from "three";
// import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils"; // No longer needed here

/**
 * Offsets every vertex along its normal by `offsetMM` (mm → m).
 * Quick fix for thin walls.
 */
export function thickenMesh(source: THREE.Mesh, offsetMM = 0.5): THREE.Mesh {
  const mesh = source.clone() as THREE.Mesh;
  mesh.geometry = source.geometry.clone();

  const geom = mesh.geometry as THREE.BufferGeometry;
  geom.computeVertexNormals();

  const pos = geom.attributes.position as THREE.BufferAttribute;
  const norm = geom.attributes.normal as THREE.BufferAttribute;
  const d = offsetMM / 1000; // convert mm → metres

  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + norm.getX(i) * d,
      pos.getY(i) + norm.getY(i) * d,
      pos.getZ(i) + norm.getZ(i) * d
    );
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  geom.computeBoundingBox();
  return mesh;
}

/** Adds uniform draft by scaling X/Z outward by tan(deg)·Y. Very simple. */
export function addDraft(mesh: THREE.Mesh, deg = 3): THREE.Mesh {
  const clone = mesh.clone() as THREE.Mesh;
  clone.geometry = mesh.geometry.clone();

  const geom = clone.geometry as THREE.BufferGeometry;
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const k = Math.tan((deg * Math.PI) / 180);

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setX(i, pos.getX(i) + k * y);
    pos.setZ(i, pos.getZ(i) + k * y);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return clone;
}

/** Stub – just returns mesh for now (future: boolean cut side‑actions) */
export function removeUndercuts(mesh: THREE.Mesh): THREE.Mesh {
  return mesh;
}

// Accept affectedFaces as an optional argument for highlighting
export function applyGeometryFix(mesh: THREE.Mesh, issueType: string, affectedFaces?: number[]): void {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  // Log geometry state before modification
  console.log('[applyGeometryFix] Before modification:', {
    hasIndex: !!geometry.index,
    vertexCount: geometry.attributes.position.count,
    indexCount: geometry.index ? geometry.index.count : 0
  });
  // 1. Highlight affected faces (set color)
  if (!geometry.attributes.color) {
    const colorAttr = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colorAttr[i * 3 + 0] = 0.7;
      colorAttr[i * 3 + 1] = 0.7;
      colorAttr[i * 3 + 2] = 0.7;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3));
  }
  const color = geometry.attributes.color as THREE.BufferAttribute;

  if (affectedFaces) {
    // Highlight affected faces in red
    for (const faceIdx of affectedFaces) {
      for (let j = 0; j < 3; j++) {
        let idx;
        if (geometry.index) {
          idx = geometry.index.getX(faceIdx * 3 + j);
        } else {
          idx = faceIdx * 3 + j;
        }
        color.setXYZ(idx, 1, 0, 0); // Red
      }
    }
    color.needsUpdate = true;
  }

  // 2. Safe per-vertex modification: apply to all vertices to eliminate fragmentation
  if (!affectedFaces) {
    return;
  }
  // Ensure geometry is non-indexed so modifications don't break shared vertices
  if (geometry.index) {
    mesh.geometry = geometry.toNonIndexed();
  }
  const nonIndexedGeometry = mesh.geometry as THREE.BufferGeometry;
  if (nonIndexedGeometry.index !== null) {
    console.error('[DFM Fragmentation] Geometry is still indexed!');
  } else {
    console.log('[DFM Fragmentation] Geometry is non-indexed and safe for modification.');
  }
  // Only declare 'pos' once here
  const pos = nonIndexedGeometry.attributes.position as THREE.BufferAttribute;
  // Apply the modification to all vertices
  for (let idx = 0; idx < pos.count; idx++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, idx);
    const before = v.clone();
    switch (issueType) {
      case "thinWalls":
        v.multiplyScalar(1.2); // Dramatic inflation
        break;
      case "undercuts":
        v.y += 2; // Large Y shift
        break;
      case "sharpCorners":
        v.x += 2; v.z += 2; // Large X/Z shift
        break;
      case "lowDraft":
        v.y += 1.5;
        break;
      case "smallHoles":
        v.multiplyScalar(1.15);
        break;
      case "ribs":
        v.multiplyScalar(1.12);
        break;
      case "bosses":
        v.x += 2; v.z += 2;
        break;
      case "wallTransitions":
        v.multiplyScalar(1.08);
        break;
      case "sinkWarpage":
        v.y -= 1.2;
        break;
      case "closeFeatures":
        v.multiplyScalar(1.1);
        break;
      case "internalText":
        v.y += 1.2;
        break;
      case "ejection":
        v.y += 2;
        break;
      default:
        break;
    }
    pos.setXYZ(idx, v.x, v.y, v.z);
    if (idx < 10) {
      console.log(`[DFM DEBUG] idx=${idx}, before=(${before.x.toFixed(2)},${before.y.toFixed(2)},${before.z.toFixed(2)}), after=(${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)})`);
    }
  }
  pos.needsUpdate = true;
  nonIndexedGeometry.computeVertexNormals();
  // Log geometry state after modification
  console.log('[applyGeometryFix] After modification:', {
    hasIndex: !!mesh.geometry.index,
    vertexCount: mesh.geometry.attributes.position.count,
    indexCount: mesh.geometry.index ? mesh.geometry.index.count : 0
  });
}