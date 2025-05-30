import * as THREE from "three";
import { analyzeDFMIssues } from "../utils/dfmAnalyzer";
import { getFixRecommendations } from "../utils/dfmFixSuggestor";
import { applyGeometryFix } from "../utils/geometryEdit";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";

export async function generateV2WithFixes(mesh: THREE.Mesh): Promise<{ updated: THREE.Mesh; summary: string; changeMap: Record<string, number[]> }> {
  const issues = analyzeDFMIssues(mesh);
  // Log number of faces flagged for each issue
  Object.entries(issues).forEach(([issue, arr]) => {
    console.log(`[DFM] Issue: ${issue}, Faces flagged: ${Array.isArray(arr) ? arr.length : 0}`);
  });
  let summary = "I've created an improved version of your part with the following changes:\n\n";

  const clonedMesh = mesh.clone();
  let geom = clonedMesh.geometry as THREE.BufferGeometry;
  console.log('[V2] After clone:', {
    hasIndex: !!geom.index,
    vertexCount: geom.attributes.position.count,
    indexCount: geom.index ? geom.index.count : 0
  });
  // Convert to non-indexed, then weld to guarantee shared vertices
  if (!geom.index) {
    geom = geom.toNonIndexed();
    console.log('[V2] After toNonIndexed:', {
      hasIndex: !!geom.index,
      vertexCount: geom.attributes.position.count,
      indexCount: geom.index ? geom.index.count : 0
    });
  }
  geom = mergeVertices(geom);
  console.log('[V2] After mergeVertices:', {
    hasIndex: !!geom.index,
    vertexCount: geom.attributes.position.count,
    indexCount: geom.index ? geom.index.count : 0
  });
  clonedMesh.geometry = geom;

  const changeMap: Record<string, number[]> = {};

  Object.keys(issues).forEach((issueType) => {
    const affected = issues[issueType];
    if (affected && affected.length > 0) {
      const faceIndices = affected.map((f: any) => typeof f === "number" ? f : f.face).filter((idx: number | undefined) => typeof idx === "number");
      applyGeometryFix(clonedMesh, issueType, faceIndices);
      if (!changeMap[issueType]) changeMap[issueType] = [];
      changeMap[issueType].push(...faceIndices);
      summary += `• ${getFixRecommendations(issueType)} (${faceIndices.length} region${faceIndices.length > 1 ? 's' : ''})\n`;
    }
  });

  // Final geometry state
  const finalGeom = clonedMesh.geometry as THREE.BufferGeometry;
  console.log('[V2] Final geometry:', {
    hasIndex: !!finalGeom.index,
    vertexCount: finalGeom.attributes.position.count,
    indexCount: finalGeom.index ? finalGeom.index.count : 0
  });

  return { updated: clonedMesh, summary, changeMap };
}