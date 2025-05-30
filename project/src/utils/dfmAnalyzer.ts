import * as THREE from "three";

export function analyzeDFMIssues(mesh: THREE.Mesh) {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  geometry.computeBoundingBox();
  geometry.computeVertexNormals();

  const issues = {
    thinWalls: [],
    undercuts: [],
    sharpCorners: [],
    smallHoles: [],
    lowDraft: [],
    ribs: [],
    bosses: [],
    wallTransitions: [],
    sinkWarpage: [],
    closeFeatures: [],
    internalText: [],
    ejection: []
  };

  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const up = new THREE.Vector3(0, 1, 0);
  const faceCount = pos.count / 3;

  for (let i = 0; i < faceCount; i++) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 0);
    const b = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);

    const n = new THREE.Vector3().fromBufferAttribute(norm, i * 3);
    const angle = n.angleTo(up) * (180 / Math.PI);

    const edge1 = new THREE.Vector3().subVectors(b, a);
    const edge2 = new THREE.Vector3().subVectors(c, b);
    const edge3 = new THREE.Vector3().subVectors(a, c);
    const minEdge = Math.min(edge1.length(), edge2.length(), edge3.length());
    const maxEdge = Math.max(edge1.length(), edge2.length(), edge3.length());

    // Existing checks
    if (minEdge < 1.5) issues.thinWalls.push(i);
    if (angle > 85) issues.undercuts.push(i);
    if (angle > 30 && angle < 50) issues.sharpCorners.push(i);
    if (minEdge < 0.5) issues.smallHoles.push({ face: i, diameter: minEdge });
    if (angle < 3) issues.lowDraft.push(i);

    // New: Rib detection (long, thin face)
    if (minEdge < 2 && maxEdge > 6) issues.ribs.push(i);
    // New: Boss detection (circular, thick, isolated face)
    if (Math.abs(edge1.length() - edge2.length()) < 0.2 && Math.abs(edge1.length() - edge3.length()) < 0.2 && minEdge > 2 && maxEdge < 8) issues.bosses.push(i);
    // New: Wall thickness transitions
    if (Math.abs(maxEdge - minEdge) > 1.5) issues.wallTransitions.push(i);
    // New: Sink/warpage risk (thick regions)
    if (maxEdge > 8 && minEdge > 2) issues.sinkWarpage.push(i);
    // New: Close features (edges very close)
    if (minEdge < 0.8 && maxEdge > 2) issues.closeFeatures.push(i);
    // New: Internal text/logo (short, shallow faces)
    if (maxEdge < 1 && minEdge < 0.3 && angle > 60) issues.internalText.push(i);
    // New: Ejection issues (deep faces, high aspect ratio)
    if (maxEdge > 10 && angle < 2) issues.ejection.push(i);
  }

  return issues;
}