import * as THREE from 'three'

export function extractPartMetadata(mesh: THREE.Mesh) {
  const geometry = mesh.geometry as THREE.BufferGeometry
  const position = geometry.attributes.position
  // Removed unused: const vertices = position.array
  const normals = geometry.attributes.normal?.array
  const metadata: any = {
    thinWalls: [],
    sharpCorners: [],
    holes: [],
    draftIssues: []
  }

  const wallThreshold = 1.5 // mm
  const sharpAngleThreshold = 30 // degrees

  // Calculate bounding box to scale reference (optional)
  geometry.computeBoundingBox()
  const size = new THREE.Vector3()
  geometry.boundingBox?.getSize(size)

  // --- Thin wall estimation (advanced ray-casting method) ---
  // For each face, cast a ray from centroid along negative normal, find intersection, measure wall thickness
  const raycaster = new THREE.Raycaster();
  for (let i = 0; i < position.count; i += 3) {
    // Get face vertices
    const v1 = new THREE.Vector3().fromBufferAttribute(position, i);
    const v2 = new THREE.Vector3().fromBufferAttribute(position, i + 1);
    const v3 = new THREE.Vector3().fromBufferAttribute(position, i + 2);
    // Compute centroid
    const centroid = new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3);
    // Compute face normal
    const normal = getNormal([v1, v2, v3]);
    // Cast ray inward (negative normal)
    raycaster.set(centroid, normal.clone().negate());
    // Intersect with mesh (excluding the originating face)
    const intersects = raycaster.intersectObject(mesh, true)
      .filter(inter => inter.distance > 1e-5); // ignore self-intersection
    if (intersects.length > 0) {
      const thickness = intersects[0].distance;
      if (thickness < wallThreshold) {
        metadata.thinWalls.push({
          position: centroid.toArray(),
          thickness: thickness.toFixed(2),
          severity: thickness < wallThreshold * 0.5 ? 'high' : 'medium',
          message: `Wall thickness = ${thickness.toFixed(2)}mm (< ${wallThreshold}mm)`
        });
      }
    }
  }

  // --- Sharp corner detection (face angle deviation) ---
  geometry.computeVertexNormals()
  // Removed: BufferGeometry has no computeFaceNormals

  const faces: THREE.Vector3[][] = []
  for (let i = 0; i < position.count; i += 3) {
    const v1 = new THREE.Vector3().fromBufferAttribute(position, i)
    const v2 = new THREE.Vector3().fromBufferAttribute(position, i + 1)
    const v3 = new THREE.Vector3().fromBufferAttribute(position, i + 2)
    faces.push([v1, v2, v3])
  }

  for (let i = 0; i < faces.length - 1; i++) {
    const f1 = faces[i], f2 = faces[i + 1]
    const n1 = getNormal(f1), n2 = getNormal(f2)
    const angle = n1.angleTo(n2) * (180 / Math.PI)
    if (angle < sharpAngleThreshold) {
      metadata.sharpCorners.push({
        position: f1[0].toArray(),
        angle: angle.toFixed(1),
        severity: 'medium',
        message: `Corner angle = ${angle.toFixed(1)}°, considered sharp`
      })
    }
  }

  // Optional: hole detection, draft angle checks, etc.
  // Add additional geometry classifiers here

  return metadata
}

function getNormal(face: THREE.Vector3[]) {
  const cb = new THREE.Vector3(), ab = new THREE.Vector3()
  cb.subVectors(face[2], face[1])
  ab.subVectors(face[0], face[1])
  cb.cross(ab).normalize()
  return cb
}