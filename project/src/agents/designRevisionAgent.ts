import { Mesh, Vector3 } from 'three';
import { thickenMesh, addDraft, removeUndercuts } from '../utils/geometryEdit';
import { analyzeFeatures } from '../utils/featureRecognition';
import { generateV2WithFixes } from './FixAllPlanner';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:designRevisionAgent');

interface DesignRevisionResult {
  revisedMesh: Mesh;
  originalDFM: any;
  summary: string;
  changeMap: Record<string, number[]>;
}

export async function designRevisionAgent(mesh: Mesh): Promise<DesignRevisionResult> {
  try {
    logger('Starting design revision agent with mesh:', !!mesh);
    
    if (!mesh) {
      throw new Error('No mesh provided for revision');
    }

    // --- Ensure geometry is non-indexed before DFM analysis ---
    if (mesh.geometry.index) {
      mesh.geometry = mesh.geometry.toNonIndexed();
    }
    // Get the V2 mesh with DFM fixes
    const { updated: revisedMesh, summary } = await generateV2WithFixes(mesh);
    if (revisedMesh.geometry.index) {
      revisedMesh.geometry = revisedMesh.geometry.toNonIndexed();
    }
    // Analyze the original mesh to identify issues
    const pullDirection = new Vector3(0, 0, 1); // Z is tool-pull direction
    const dfm = await analyzeFeatures(mesh.geometry, pullDirection);
    logger('Original mesh analysis:', dfm);

    // Analyze the revised mesh for DFM risks and build changeMap
    const v2Dfm = await analyzeFeatures(revisedMesh.geometry, pullDirection);
    logger('V2 mesh analysis:', v2Dfm);
    console.log('[DFM DEBUG] v2Dfm result:', v2Dfm);

    // Debug: log example risk object for each risk type
    for (const riskType of Object.keys(v2Dfm)) {
      if (Array.isArray(v2Dfm[riskType]) && v2Dfm[riskType].length > 0) {
        console.log(`[DFM DEBUG] Example risk for ${riskType}:`, v2Dfm[riskType][0]);
      }
    }

    // Build changeMap from v2Dfm risks (extract faceIndex from each risk object)
    const changeMap: Record<string, number[]> = {};
    for (const riskType of Object.keys(v2Dfm)) {
      if (Array.isArray(v2Dfm[riskType])) {
        if (riskType === 'sharpCorners') {
          // Flatten all region face indices for sharpCorners
          changeMap[riskType] = v2Dfm[riskType].flatMap((region: any) =>
            Array.isArray(region.faceIndices) ? region.faceIndices : (region.faceIndex !== undefined ? [region.faceIndex] : [])
          );
        } else if (riskType === 'thinWalls') {
          // For thinWalls, use ALL detected face indices, not just the filtered (top 5)
          // v2Dfm.thinWalls is an array of { position, thickness, faceIndex }
          changeMap[riskType] = v2Dfm[riskType]
            .map((risk: any) => risk.faceIndex)
            .filter((idx: any) => typeof idx === 'number');
        } else {
          changeMap[riskType] = v2Dfm[riskType]
            .map((risk: any) => risk.faceIndex)
            .filter((idx: any) => typeof idx === 'number');
        }
      }
    }
    console.log('[DFM DEBUG] changeMap:', JSON.stringify(changeMap, null, 2));

    return { 
      revisedMesh,
      originalDFM: dfm,
      summary,
      changeMap
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in design revision agent:', errorMsg);
    throw new Error(`Design revision failed: ${errorMsg}`);
  }
}