import { useEffect, useState, Suspense, useCallback, useMemo, useRef } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three-stdlib';
import { useModelStore } from '../store/modelStore';
import { Cube } from './shapes/Cube';
import { Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Mesh, 
  Box3, 
  Vector3, 
  LoadingManager,
  Group,
  Raycaster,
  Vector2,
  Material,
  Color,
  DoubleSide,
  BufferGeometry,
  MeshStandardMaterial
} from 'three';
import { loadDXFFile } from '../utils/dxfLoader';
import { loadSTEPFile } from '../utils/stepLoader';
import { analyzeGeometry } from '../utils/geometryAnalysis';
import { calculateVolumeAndSurfaceAreaFromMesh } from '../utils/geometryAnalysis';
import { analyzeDFMRisksPerFace } from '../functions/dfmRiskFunctions';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// --- Utility: Per-Face DFM Risk Calculation ---
function calculateDFMRisksPerFace(geometry: THREE.BufferGeometry): { faceIndex: number, type: string, riskScore: number }[] {
  const position = geometry.attributes.position;
  const faces = position.count / 3;
  const risks = [];
  // Simple thresholds (customize as needed)
  const THIN_WALL_THRESHOLD = 1.5; // mm
  const SHARP_ANGLE_THRESHOLD = 35 * Math.PI / 180; // radians
  for (let i = 0; i < faces; i++) {
    // Get 3 vertices of the face
    const vA = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 0);
    const vB = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 1);
    const vC = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 2);
    // Compute edge vectors
    const ab = new THREE.Vector3().subVectors(vB, vA);
    const bc = new THREE.Vector3().subVectors(vC, vB);
    const ca = new THREE.Vector3().subVectors(vA, vC);
    // Compute face normal
    const normal = new THREE.Vector3().crossVectors(ab, ca).normalize();
    // Simple sharp angle check (angle between edges)
    const angleAB_BC = ab.angleTo(bc);
    const angleBC_CA = bc.angleTo(ca);
    const angleCA_AB = ca.angleTo(ab);
    const minAngle = Math.min(angleAB_BC, angleBC_CA, angleCA_AB);
    // Simple thickness estimate: shortest edge
    const minEdge = Math.min(ab.length(), bc.length(), ca.length());
    // Risk assignment
    let type = 'none';
    let riskScore = 0;
    if (minEdge < THIN_WALL_THRESHOLD) {
      type = 'thin_wall';
      riskScore = 1 - minEdge / THIN_WALL_THRESHOLD;
    } else if (minAngle < SHARP_ANGLE_THRESHOLD) {
      type = 'sharp_corner';
      riskScore = 1 - minAngle / SHARP_ANGLE_THRESHOLD;
    } else {
      // For demo, let's say faces with normals close to Z- are undercuts
      if (normal.z < 0.1) {
        type = 'undercut';
        riskScore = 0.7;
      }
    }
    risks.push({ faceIndex: i, type, riskScore });
  }
  return risks;
}

export function applyDFMHeatmap(
  mesh: THREE.Mesh,
  geometry: THREE.BufferGeometry,
  dfmRisks: DFMFaceRisk[]
) {
  const heatmapEnabled = useModelStore.getState().heatmapEnabled;
  if (!heatmapEnabled || !geometry.attributes.position) return;

  // --- Use per-face risk calculation if dfmRisks is empty or undefined ---
  let risks = dfmRisks && dfmRisks.length > 0 ? dfmRisks : calculateDFMRisksPerFace(geometry);

  // --- Improved Color assignment ---
  const colorArray: number[] = [];
  const faceCount = geometry.attributes.position.count / 3;
  // Improved base and risk colors (strong contrast)
  const defaultColor = new THREE.Color('#ffffff'); // Pure white for no risk
  const colorMap = {
    undercut: new THREE.Color('#e53935'),      // High Risk: Bright Red
    thin_wall: new THREE.Color('#fb8c00'),     // Medium Risk: Bright Orange
    sharp_corner: new THREE.Color('#1976d2'),  // Low Risk: Bright Blue
  };
  for (let i = 0; i < faceCount; i++) {
    const match = risks.find(r => r.faceIndex === i && r.type !== 'none');
    let color = defaultColor;
    if (match) {
      if (match.type in colorMap) {
        const baseColor = colorMap[match.type];
        color = baseColor;
      }
    }
    colorArray.push(color.r, color.g, color.b);
    colorArray.push(color.r, color.g, color.b);
    colorArray.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
  mesh.material.vertexColors = true;
  mesh.material.needsUpdate = true;
  // --- Ensure the material uses vertex colors ---
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => { m.vertexColors = true; m.needsUpdate = true; });
    } else {
      mesh.material.vertexColors = true;
      mesh.material.needsUpdate = true;
    }
  }
  if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;
}

interface ModelComponentProps {
  url: string;
  setError: (error: string | null) => void;
  onProgress: (progress: number) => void;
}

const LoadingIndicator = ({ progress }: { progress: number }) => (
  <Html center>
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Loading Model...</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  </Html>
);

export const Model = () => {
  const { modelFile, fileType } = useModelStore();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const material = new MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    metalness: 0.2,
    roughness: 0.6
  });

  useEffect(() => {
    if (modelFile) {
      try {
        if (fileType === 'step' || fileType === 'stp') {
          setModelUrl(null);
        } else {
          const url = URL.createObjectURL(modelFile);
          setModelUrl(url);
          cleanupRef.current = () => URL.revokeObjectURL(url);
        }
        setError(null);
        setLoadingProgress(0);
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Failed to process file. Please check if the file is valid and try again.');
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [modelFile, fileType]);

  if (error) {
    return <Html center><div className="text-red-600">{error}</div></Html>;
  }

  if (!modelFile) {
    return <Cube position={[0, 0.5, 0]} />;
  }

  if (fileType === 'step' || fileType === 'stp') {
    return (
      <Suspense fallback={<LoadingIndicator progress={loadingProgress} />}>
        <Center>
          <STEPModel 
            file={modelFile} 
            setError={setError} 
            onProgress={setLoadingProgress} 
          />
        </Center>
      </Suspense>
    );
  }

  if (!modelUrl || !fileType) {
    return <Cube position={[0, 0.5, 0]} />;
  }

  return (
    <Suspense fallback={<LoadingIndicator progress={loadingProgress} />}>
      <Center>
        {fileType === 'obj' && (
          <OBJModel 
            url={modelUrl} 
            setError={setError} 
            onProgress={setLoadingProgress} 
          />
        )}
        {fileType === 'stl' && (
          <STLModel 
            url={modelUrl} 
            setError={setError} 
            onProgress={setLoadingProgress} 
          />
        )}
        {fileType === 'dxf' && (
          <DXFModel 
            url={modelUrl} 
            setError={setError} 
            onProgress={setLoadingProgress} 
          />
        )}
      </Center>
    </Suspense>
  );
};

interface STEPModelProps {
  file: File;
  setError: (error: string | null) => void;
  onProgress: (progress: number) => void;
}

const STEPModel: React.FC<STEPModelProps> = ({ file, setError, onProgress }) => {
  const { materialState, heatmapEnabled, dfmRisks } = useModelStore();
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        onProgress(10);
        const loadedGeometry = await loadSTEPFile(file);
        onProgress(90);
        
        if (!loadedGeometry.attributes.position) {
          throw new Error('Invalid geometry: missing position attribute');
        }

        loadedGeometry.computeVertexNormals();
        loadedGeometry.computeBoundingBox();
        
        const mesh = new Mesh(loadedGeometry, materialState.defaultMaterial);
        mesh.updateMatrixWorld(true);

        // Create transformed geometry for analysis
        const transformedGeometry = loadedGeometry.clone();
        transformedGeometry.applyMatrix4(mesh.matrixWorld);
        
        try {
          // Align pull-direction for analysis
          const pullDirection = new Vector3(0, 0, 1); // Z is tool-pull
          const analysis = analyzeGeometry(transformedGeometry, pullDirection);
          useModelStore.getState().setCadAnalysis({
            volume: analysis.volume,
            surfaceArea: analysis.surfaceArea,
            complexity: analysis.complexity,
            features: analysis.features,
            dimensions: {
              width: loadedGeometry.boundingBox?.max.x - loadedGeometry.boundingBox?.min.x || 0,
              height: loadedGeometry.boundingBox?.max.y - loadedGeometry.boundingBox?.min.y || 0,
              depth: loadedGeometry.boundingBox?.max.z - loadedGeometry.boundingBox?.min.z || 0
            },
            manufacturabilityScore: analysis.manufacturabilityScore
          });
        } catch (error) {
          console.error('Error analyzing geometry:', error);
        }

        setGeometry(loadedGeometry);
        onProgress(100);
      } catch (error) {
        console.error('Error loading STEP file:', error);
        setError('Failed to load STEP file. Please check the file format.');
      }
    };

    loadModel();
  }, [file, setError, onProgress]);

  useEffect(() => {
    if (geometry && heatmapEnabled && dfmRisks.length > 0) {
      const mesh = new Mesh(geometry, material);
      applyDFMHeatmap(mesh, geometry, dfmRisks);
    }
  }, [geometry, heatmapEnabled, dfmRisks]);

  useEffect(() => {
    if (!geometry) return;
    console.log('[DFM DEBUG] No model loaded');
    const { heatmapEnabled, dfmRisks } = useModelStore.getState();
    console.log('[DFM DEBUG] useEffect triggered', { heatmapEnabled, dfmRisksLen: dfmRisks?.length, geometry });
    geometry.traverse(child => {
      if (child.isMesh && child.geometry) {
        console.log('[DFM DEBUG] Applying heatmap to mesh', child.name || child.id);
        applyDFMHeatmap(child, child.geometry, dfmRisks);
        if (child.material) child.material.needsUpdate = true;
        if (child.geometry.attributes.color) child.geometry.attributes.color.needsUpdate = true;
      }
    });
  }, [geometry, heatmapEnabled, useModelStore.getState().dfmRisks]);

  useEffect(() => {
    console.log('[DFM DEBUG] useEffect heatmapEnabled:', heatmapEnabled, 'dfmRisks:', dfmRisks);
    if (heatmapEnabled && dfmRisks && dfmRisks.length > 0) {
      console.log('[DFM DEBUG] Applying heatmap to model with risks:', dfmRisks);
    }
  }, [heatmapEnabled, dfmRisks]);

  useEffect(() => {
    if (!model) return;
    const canvas = gl.domElement;
    const handleClickOutside = (event: MouseEvent) => {
      // Only deactivate if the heatmap is enabled and the click target is the canvas (not a UI element)
      if (useModelStore.getState().heatmapEnabled && event.target === canvas) {
        useModelStore.getState().toggleHeatmap(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [model, gl]);

  if (!geometry) {
    return null;
  }

  const mesh = new Mesh(
    geometry,
    materialState.defaultMaterial
  );

  useEffect(() => {
    if (mesh) {
      mesh.updateMatrixWorld(true);
      
      const transformedGeometry = mesh.geometry.clone();
      transformedGeometry.applyMatrix4(mesh.matrixWorld);
      
      // Run DFM analysis
      const dfmRisks = analyzeDFMRisksPerFace(transformedGeometry);
      
      // Apply heatmap colors if enabled
      if (heatmapEnabled) {
        applyDFMHeatmap(mesh, transformedGeometry, dfmRisks);
      }
      
      // Update material
      mesh.material = material;
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      const box = new Box3().setFromObject(mesh);
      const center = new Vector3();
      const size = new Vector3();
      box.getCenter(center);
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5 / maxDim;
      
      mesh.scale.setScalar(scale);
      mesh.position.copy(center).multiplyScalar(-scale);
      mesh.position.y += size.y * scale / 2;
    }
  }, [mesh, material, heatmapEnabled]);

  const [hoveredRisk, setHoveredRisk] = useState<DFMFaceRisk | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mesh) return;
    const canvas = gl.domElement;
    const handleMouseMove = (event: MouseEvent) => {
      if (!mesh) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(mesh, true);
      if (intersects.length > 0) {
        const faceIndex = intersects[0].face?.a !== undefined ? Math.floor(intersects[0].faceIndex ?? -1) : -1;
        if (faceIndex !== -1 && Array.isArray(dfmRisks)) {
          const risk = dfmRisks.find(r => r.faceIndex === faceIndex);
          if (risk) {
            setHoveredRisk(risk);
            setTooltipPos({ x: event.clientX, y: event.clientY });
            return;
          }
        }
      }
      setHoveredRisk(null);
      setTooltipPos(null);
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [mesh, gl, camera, dfmRisks]);

  return (
    <>
      {mesh ? (
        <>
          <primitive object={mesh} />
          {tooltipPos && hoveredRisk && (
            <Tippy
              content={
                <div style={{ minWidth: 180 }}>
                  <div className="font-semibold text-red-700">❗ {hoveredRisk.type.replace('_', ' ').toUpperCase()}</div>
                  {hoveredRisk.thickness && (
                    <div>Thickness: {hoveredRisk.thickness.toFixed(2)}mm</div>
                  )}
                  {hoveredRisk.recommendation && (
                    <div>Recommendation: {hoveredRisk.recommendation}</div>
                  )}
                  {hoveredRisk.impact && (
                    <div>Impact: <span className="font-bold">{hoveredRisk.impact}</span></div>
                  )}
                </div>
              }
              visible={true}
              interactive={false}
              placement="right"
              getReferenceClientRect={() => ({
                width: 0,
                height: 0,
                top: tooltipPos.y,
                left: tooltipPos.x,
                bottom: tooltipPos.y,
                right: tooltipPos.x,
                x: tooltipPos.x,
                y: tooltipPos.y,
                toJSON: () => ''
              })}
            >
              <div />
            </Tippy>
          )}
        </>
      ) : null}
    </>
  );
};

const OBJModel = ({ url, setError, onProgress }: ModelComponentProps) => {
  const manager = useMemo(() => new LoadingManager(), []);
  const { camera, gl } = useThree();
  const { 
    viewerState, 
    selectedParts,
    addSelectedPart,
    removeSelectedPart,
    clearSelectedParts,
    controlsRef,
    materialState,
    setTransformTarget,
    heatmapEnabled,
    dfmRisks,
    setSelectedMesh
  } = useModelStore();
  
  const [model, setModel] = useState<Group | null>(null);
  const modelRef = useRef<Group | null>(null);
  const isSelecting = useRef(false);
  const isMouseDown = useRef(false);

  useEffect(() => {
    manager.onProgress = (url, loaded, total) => {
      onProgress((loaded / total) * 100);
    };

    manager.onError = (url) => {
      setError(`Failed to load model from ${url}`);
    };
  }, [manager, onProgress, setError]);

  const obj = useLoader(OBJLoader, url, (loader) => {
    loader.manager = manager;
  });

  useEffect(() => {
    if (obj && !model) {
      try {
        const clonedObj = obj.clone();
        let partIndex = 0;

        clonedObj.traverse((child) => {
          if (child instanceof Mesh) {
            if (!child.geometry.attributes.position) {
              throw new Error('Invalid geometry: missing position attribute');
            }

            child.geometry.computeVertexNormals();
            child.geometry.computeBoundingBox();
            child.name = child.name || `part_${partIndex++}`;
            
            child.material = materialState.defaultMaterial;
            child.castShadow = true;
            child.receiveShadow = true;

            try {
              // Update world matrix and create transformed geometry for analysis
              child.updateMatrixWorld(true);
              const { volume, surfaceArea } = calculateVolumeAndSurfaceAreaFromMesh(child);
              
              // Align pull-direction for analysis
              const pullDirection = new Vector3(0, 0, 1); // Z is tool-pull
              const analysis = analyzeGeometry(child.geometry, pullDirection);
              useModelStore.getState().setCadAnalysis({
                volume,
                surfaceArea,
                complexity: analysis.complexity,
                features: analysis.features,
                dimensions: {
                  width: child.geometry.boundingBox?.max.x - child.geometry.boundingBox?.min.x || 0,
                  height: child.geometry.boundingBox?.max.y - child.geometry.boundingBox?.min.y || 0,
                  depth: child.geometry.boundingBox?.max.z - child.geometry.boundingBox?.min.z || 0
                },
                manufacturabilityScore: analysis.manufacturabilityScore
              });

              // Store the selected mesh for unit scaling
              useModelStore.getState().setSelectedMesh(child);

              // Apply DFM heatmap if enabled
              if (heatmapEnabled) {
                const dfmRisks = analyzeDFMRisksPerFace(child.geometry);
                applyDFMHeatmap(child, child.geometry, dfmRisks);
              }
            } catch (error) {
              console.error('Error analyzing geometry:', error);
            }
          }
        });

        const box = new Box3().setFromObject(clonedObj);
        const center = new Vector3();
        const size = new Vector3();
        box.getCenter(center);
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        
        clonedObj.scale.setScalar(scale);
        clonedObj.position.copy(center).multiplyScalar(-scale);
        clonedObj.position.y += size.y * scale / 2;

        setModel(clonedObj);
        modelRef.current = clonedObj;
        onProgress(100);
      } catch (err) {
        console.error('Error processing model:', err);
        setError('Failed to process model. Please check the file format and try again.');
      }
    }

    return () => {
      if (model) {
        model.traverse((child) => {
          if (child instanceof Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [obj, model, onProgress, setError, materialState.defaultMaterial, heatmapEnabled]);

  // Update heatmap when enabled/disabled
  useEffect(() => {
    if (model) {
      model.traverse((child) => {
        if (child instanceof Mesh) {
          if (heatmapEnabled) {
            const dfmRisks = analyzeDFMRisksPerFace(child.geometry);
            applyDFMHeatmap(child, child.geometry, dfmRisks);
          } else {
            child.material = materialState.defaultMaterial;
          }
        }
      });
    }
  }, [heatmapEnabled, model, materialState.defaultMaterial]);

  useEffect(() => {
    if (!model) return;
    console.log('[DFM DEBUG] No model loaded');
    const { heatmapEnabled, dfmRisks } = useModelStore.getState();
    console.log('[DFM DEBUG] useEffect triggered', { heatmapEnabled, dfmRisksLen: dfmRisks?.length, model });
    model.traverse(child => {
      if (child.isMesh && child.geometry) {
        console.log('[DFM DEBUG] Applying heatmap to mesh', child.name || child.id);
        applyDFMHeatmap(child, child.geometry, dfmRisks);
        if (child.material) child.material.needsUpdate = true;
        if (child.geometry.attributes.color) child.geometry.attributes.color.needsUpdate = true;
      }
    });
  }, [model, heatmapEnabled, useModelStore.getState().dfmRisks]);

  useEffect(() => {
    console.log('[DFM DEBUG] useEffect heatmapEnabled:', heatmapEnabled, 'dfmRisks:', dfmRisks);
    if (heatmapEnabled && dfmRisks && dfmRisks.length > 0) {
      console.log('[DFM DEBUG] Applying heatmap to model with risks:', dfmRisks);
    }
  }, [heatmapEnabled, dfmRisks]);

  const handleSelect = useCallback((event: MouseEvent) => {
    if (!modelRef.current || isSelecting.current || isMouseDown.current) {
      return;
    }

    try {
      isSelecting.current = true;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(modelRef.current, true);

      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject instanceof Mesh) {
          const isAlreadySelected = selectedParts.some(part => part.uuid === selectedObject.uuid);

          if (!event.shiftKey) {
            selectedParts.forEach(part => {
              if (part instanceof Mesh) {
                part.material = materialState.defaultMaterial;
              }
            });
            clearSelectedParts();
          }

          if (event.shiftKey && isAlreadySelected) {
            removeSelectedPart(selectedObject);
            selectedObject.material = materialState.defaultMaterial;
          } else if (!isAlreadySelected) {
            selectedObject.material = materialState.highlightMaterial;
            addSelectedPart(selectedObject);
          }

          if (selectedObject.parent) {
            setTransformTarget(selectedObject.parent);
          }
          
          // Store the selected mesh for unit scaling
          useModelStore.getState().setSelectedMesh(selectedObject);
        }
      } else if (!event.shiftKey) {
        selectedParts.forEach(part => {
          if (part instanceof Mesh) {
            part.material = materialState.defaultMaterial;
          }
        });
        clearSelectedParts();
        setTransformTarget(null);
      }
    } catch (error) {
      console.error('Error in handleSelect:', error);
    } finally {
      isSelecting.current = false;
    }
  }, [
    camera,
    gl,
    selectedParts,
    addSelectedPart,
    removeSelectedPart,
    clearSelectedParts,
    materialState,
    setTransformTarget
  ]);

  useEffect(() => {
    if (!modelRef.current) return;
    
    const canvas = gl.domElement;
    
    const handleMouseDown = () => {
      isMouseDown.current = true;
      if (controlsRef?.current) {
        controlsRef.current.enabled = viewerState.mode === 'orbit' && viewerState.transformMode === 'none';
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      if (controlsRef?.current) {
        controlsRef.current.enabled = viewerState.mode === 'orbit' && viewerState.transformMode === 'none';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isMouseDown.current) {
        handleSelect(e);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('mouseup', handleMouseUp);
      isMouseDown.current = false;
    };
  }, [gl, handleSelect, controlsRef, viewerState.mode, viewerState.transformMode]);

  useEffect(() => {
    if (!modelRef.current) return;
    const canvas = gl.domElement;
    const handleClickOutside = (event: MouseEvent) => {
      // Only deactivate if the heatmap is enabled and the click target is the canvas (not a UI element)
      if (useModelStore.getState().heatmapEnabled && event.target === canvas) {
        useModelStore.getState().toggleHeatmap(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modelRef, gl]);

  const [hoveredRisk, setHoveredRisk] = useState<DFMFaceRisk | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!modelRef.current) return;
    const canvas = gl.domElement;
    const handleMouseMove = (event: MouseEvent) => {
      if (!modelRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(modelRef.current, true);
      if (intersects.length > 0) {
        const faceIndex = intersects[0].face?.a !== undefined ? Math.floor(intersects[0].faceIndex ?? -1) : -1;
        if (faceIndex !== -1 && Array.isArray(dfmRisks)) {
          const risk = dfmRisks.find(r => r.faceIndex === faceIndex);
          if (risk) {
            setHoveredRisk(risk);
            setTooltipPos({ x: event.clientX, y: event.clientY });
            return;
          }
        }
      }
      setHoveredRisk(null);
      setTooltipPos(null);
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [modelRef, gl, camera, dfmRisks]);

  return (
    <>
      {model ? (
        <>
          {console.log('Rendering Model primitive:', model)}
          <primitive object={model} />
          {tooltipPos && hoveredRisk && (
            <Tippy
              content={
                <div style={{ minWidth: 180 }}>
                  <div className="font-semibold text-red-700">❗ {hoveredRisk.type.replace('_', ' ').toUpperCase()}</div>
                  {hoveredRisk.thickness && (
                    <div>Thickness: {hoveredRisk.thickness.toFixed(2)}mm</div>
                  )}
                  {hoveredRisk.recommendation && (
                    <div>Recommendation: {hoveredRisk.recommendation}</div>
                  )}
                  {hoveredRisk.impact && (
                    <div>Impact: <span className="font-bold">{hoveredRisk.impact}</span></div>
                  )}
                </div>
              }
              visible={true}
              interactive={false}
              placement="right"
              getReferenceClientRect={() => ({
                width: 0,
                height: 0,
                top: tooltipPos.y,
                left: tooltipPos.x,
                bottom: tooltipPos.y,
                right: tooltipPos.x,
                x: tooltipPos.x,
                y: tooltipPos.y,
                toJSON: () => ''
              })}
            >
              <div />
            </Tippy>
          )}
        </>
      ) : null}
    </>
  );
};

const STLModel = ({ url, setError, onProgress }: ModelComponentProps) => {
  const { materialState, heatmapEnabled, setSelectedMesh } = useModelStore();
  const geometry = useLoader(STLLoader, url, (loader) => {
    loader.manager = new LoadingManager();
    loader.manager.onProgress = (url, loaded, total) => {
      onProgress((loaded / total) * 100);
    };
    loader.manager.onError = (url) => {
      setError(`Failed to load STL from ${url}`);
    };
  });

  try {
    if (!(geometry instanceof BufferGeometry)) {
      throw new Error('Invalid geometry type');
    }

    if (!geometry.attributes.position) {
      throw new Error('Invalid geometry: missing position attribute');
    }

    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }

    const mesh = new Mesh(
      geometry,
      materialState.defaultMaterial
    );

    useEffect(() => {
      if (mesh) {
        try {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          const box = new Box3().setFromObject(mesh);
          const center = new Vector3();
          const size = new Vector3();
          box.getCenter(center);
          box.getSize(size);

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 5 / maxDim;
          
          mesh.scale.setScalar(scale);
          mesh.position.copy(center).multiplyScalar(-scale);
          mesh.position.y += size.y * scale / 2;

          // Update world matrix and analyze transformed geometry
          mesh.updateMatrixWorld(true);
          const { volume, surfaceArea } = calculateVolumeAndSurfaceAreaFromMesh(mesh);
          
          // Align pull-direction for analysis
          const pullDirection = new Vector3(0, 0, 1); // Z is tool-pull
          const analysis = analyzeGeometry(geometry, pullDirection);
          useModelStore.getState().setCadAnalysis({
            volume,
            surfaceArea,
            complexity: analysis.complexity,
            features: analysis.features,
            dimensions: {
              width: size.x,
              height: size.y,
              depth: size.z
            },
            manufacturabilityScore: analysis.manufacturabilityScore
          });

          // Store the selected mesh for unit scaling
          setSelectedMesh(mesh);

          // Apply DFM heatmap if enabled
          if (heatmapEnabled) {
            const dfmRisks = analyzeDFMRisksPerFace(geometry);
            applyDFMHeatmap(mesh, geometry, dfmRisks);
          }
        } catch (err) {
          console.error('Error processing STL:', err);
          setError('Failed to process STL model');
        }
      }
    }, [mesh, setError, heatmapEnabled]);

    useEffect(() => {
      if (!mesh) return;
      console.log('[DFM DEBUG] No model loaded');
      const { heatmapEnabled, dfmRisks } = useModelStore.getState();
      console.log('[DFM DEBUG] useEffect triggered', { heatmapEnabled, dfmRisksLen: dfmRisks?.length, mesh });
      mesh.traverse(child => {
        if (child.isMesh && child.geometry) {
          console.log('[DFM DEBUG] Applying heatmap to mesh', child.name || child.id);
          applyDFMHeatmap(child, child.geometry, dfmRisks);
          if (child.material) child.material.needsUpdate = true;
          if (child.geometry.attributes.color) child.geometry.attributes.color.needsUpdate = true;
        }
      });
    }, [mesh, heatmapEnabled, useModelStore.getState().dfmRisks]);

    useEffect(() => {
      console.log('[DFM DEBUG] useEffect heatmapEnabled:', heatmapEnabled, 'dfmRisks:', dfmRisks);
      if (heatmapEnabled && dfmRisks && dfmRisks.length > 0) {
        console.log('[DFM DEBUG] Applying heatmap to model with risks:', dfmRisks);
      }
    }, [heatmapEnabled, dfmRisks]);

    const [hoveredRisk, setHoveredRisk] = useState<DFMFaceRisk | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
      if (!mesh) return;
      const canvas = gl.domElement;
      const handleMouseMove = (event: MouseEvent) => {
        if (!mesh) return;
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new Raycaster();
        raycaster.setFromCamera(new Vector2(x, y), camera);
        const intersects = raycaster.intersectObject(mesh, true);
        if (intersects.length > 0) {
          const faceIndex = intersects[0].face?.a !== undefined ? Math.floor(intersects[0].faceIndex ?? -1) : -1;
          if (faceIndex !== -1 && Array.isArray(dfmRisks)) {
            const risk = dfmRisks.find(r => r.faceIndex === faceIndex);
            if (risk) {
              setHoveredRisk(risk);
              setTooltipPos({ x: event.clientX, y: event.clientY });
              return;
            }
          }
        }
        setHoveredRisk(null);
        setTooltipPos(null);
      };
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }, [mesh, gl, camera, dfmRisks]);

    useEffect(() => {
      if (!mesh) return;
      const canvas = gl.domElement;
      const handleClickOutside = (event: MouseEvent) => {
        // Only deactivate if the heatmap is enabled and the click target is the canvas (not a UI element)
        if (useModelStore.getState().heatmapEnabled && event.target === canvas) {
          useModelStore.getState().toggleHeatmap(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mesh, gl]);

    return (
      <>
        {mesh ? (
          <>
            {console.log('Rendering Model primitive:', mesh)}
            <primitive object={mesh} />
            {tooltipPos && hoveredRisk && (
              <Tippy
                content={
                  <div style={{ minWidth: 180 }}>
                    <div className="font-semibold text-red-700">❗ {hoveredRisk.type.replace('_', ' ').toUpperCase()}</div>
                    {hoveredRisk.thickness && (
                      <div>Thickness: {hoveredRisk.thickness.toFixed(2)}mm</div>
                    )}
                    {hoveredRisk.recommendation && (
                      <div>Recommendation: {hoveredRisk.recommendation}</div>
                    )}
                    {hoveredRisk.impact && (
                      <div>Impact: <span className="font-bold">{hoveredRisk.impact}</span></div>
                    )}
                  </div>
                }
                visible={true}
                interactive={false}
                placement="right"
                getReferenceClientRect={() => ({
                  width: 0,
                  height: 0,
                  top: tooltipPos.y,
                  left: tooltipPos.x,
                  bottom: tooltipPos.y,
                  right: tooltipPos.x,
                  x: tooltipPos.x,
                  y: tooltipPos.y,
                  toJSON: () => ''
                })}
              >
                <div />
              </Tippy>
            )}
          </>
        ) : null}
      </>
    );
  } catch (err) {
    console.error('Error creating STL mesh:', err);
    setError('Failed to create mesh from STL file');
    return null;
  }
};

const DXFModel = ({ url, setError, onProgress }: ModelComponentProps) => {
  const [model, setModel] = useState<Group | null>(null);
  const { camera, gl } = useThree();
  const { 
    viewerState, 
    selectedParts,
    addSelectedPart,
    removeSelectedPart,
    clearSelectedParts,
    controlsRef,
    materialState,
    heatmapEnabled,
    setSelectedMesh
  } = useModelStore();
  
  const isSelecting = useRef(false);
  const isMouseDown = useRef(false);

  useEffect(() => {
    const loadDXF = async () => {
      try {
        onProgress(10);
        
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], 'model.dxf', { type: 'application/dxf' });
        
        onProgress(30);
        
        const dxfData = await loadDXFFile(file);
        
        onProgress(50);

        const group = new Group();
        const mesh = new Mesh(dxfData.geometry, materialState.defaultMaterial);
        mesh.name = 'DXF Part';
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);

        const box = new Box3().setFromObject(group);
        const center = new Vector3();
        const size = new Vector3();
        box.getCenter(center);
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;

        group.scale.setScalar(scale);
        group.position.copy(center).multiplyScalar(-scale);
        group.rotation.x = -Math.PI / 2;
        group.position.y = 0.1;

        setModel(group);
        onProgress(100);

        // Update world matrix and analyze transformed geometry
        mesh.updateMatrixWorld(true);
        const { volume, surfaceArea } = calculateVolumeAndSurfaceAreaFromMesh(mesh);
        
        // Align pull-direction for analysis
        const pullDirection = new Vector3(0, 0, 1); // Z is tool-pull
        const analysis = analyzeGeometry(dxfData.geometry, pullDirection);
        useModelStore.getState().setCadAnalysis({
          volume,
          surfaceArea,
          complexity: analysis.complexity,
          features: analysis.features,
          dimensions: {
            width: size.x,
            height: size.y,
            depth: size.z
          },
          manufacturabilityScore: analysis.manufacturabilityScore
        });

        // Store the selected mesh for unit scaling
        setSelectedMesh(mesh);

        // Apply DFM heatmap if enabled
        if (heatmapEnabled) {
          const dfmRisks = analyzeDFMRisksPerFace(dxfData.geometry);
          applyDFMHeatmap(mesh, dxfData.geometry, dfmRisks);
        }
      } catch (err) {
        console.error('Error loading DXF:', err);
        setError('Failed to load or process DXF file');
      }
    };

    loadDXF();
  }, [url, setError, onProgress, materialState.defaultMaterial, heatmapEnabled]);

  useEffect(() => {
    if (!model) return;
    console.log('[DFM DEBUG] No model loaded');
    const { heatmapEnabled, dfmRisks } = useModelStore.getState();
    console.log('[DFM DEBUG] useEffect triggered', { heatmapEnabled, dfmRisksLen: dfmRisks?.length, model });
    model.traverse(child => {
      if (child.isMesh && child.geometry) {
        console.log('[DFM DEBUG] Applying heatmap to mesh', child.name || child.id);
        applyDFMHeatmap(child, child.geometry, dfmRisks);
        if (child.material) child.material.needsUpdate = true;
        if (child.geometry.attributes.color) child.geometry.attributes.color.needsUpdate = true;
      }
    });
  }, [model, heatmapEnabled, useModelStore.getState().dfmRisks]);

  useEffect(() => {
    console.log('[DFM DEBUG] useEffect heatmapEnabled:', heatmapEnabled, 'dfmRisks:', dfmRisks);
    if (heatmapEnabled && dfmRisks && dfmRisks.length > 0) {
      console.log('[DFM DEBUG] Applying heatmap to model with risks:', dfmRisks);
    }
  }, [heatmapEnabled, dfmRisks]);

  const handleSelect = useCallback((event: MouseEvent) => {
    if (!model || viewerState.transformMode !== 'none' || isSelecting.current || isMouseDown.current) return;
    
    try {
      isSelecting.current = true;
      
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(model, true);
      
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject instanceof Mesh) {
          const isAlreadySelected = selectedParts.some(part => part.uuid === selectedObject.uuid);

          if (!event.shiftKey) {
            selectedParts.forEach(part => {
              if (part instanceof Mesh) {
                part.material = materialState.defaultMaterial;
              }
            });
            clearSelectedParts();
          }

          if (event.shiftKey && isAlreadySelected) {
            removeSelectedPart(selectedObject);
            selectedObject.material = materialState.defaultMaterial;
          } else if (!isAlreadySelected) {
            selectedObject.material = materialState.highlightMaterial;
            addSelectedPart(selectedObject);
          }
          
          // Store the selected mesh for unit scaling
          setSelectedMesh(selectedObject);
        }
      } else if (!event.shiftKey) {
        selectedParts.forEach(part => {
          if (part instanceof Mesh) {
            part.material = materialState.defaultMaterial;
          }
        });
        clearSelectedParts();
      }
    } catch (error) {
      console.error('Error in handleSelect:', error);
    } finally {
      isSelecting.current = false;
    }
  }, [
    model,
    viewerState.transformMode,
    gl,
    camera,
    selectedParts,
    addSelectedPart,
    removeSelectedPart,
    clearSelectedParts,
    materialState,
    setSelectedMesh
  ]);

  useEffect(() => {
    if (!model) return;
    
    const canvas = gl.domElement;
    
    const handleMouseDown = () => {
      isMouseDown.current = true;
      if (controlsRef?.current) {
        controlsRef.current.enabled = viewerState.mode === 'orbit' && viewerState.transformMode === 'none';
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      if (controlsRef?.current) {
        controlsRef.current.enabled = viewerState.mode === 'orbit' && viewerState.transformMode === 'none';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isMouseDown.current) {
        handleSelect(e);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('mouseup', handleMouseUp);
      isMouseDown.current = false;
    };
  }, [gl, handleSelect, controlsRef, viewerState.mode, viewerState.transformMode, model]);

  useEffect(() => {
    if (!model) return;
    const canvas = gl.domElement;
    const handleClickOutside = (event: MouseEvent) => {
      // Only deactivate if the heatmap is enabled and the click target is the canvas (not a UI element)
      if (useModelStore.getState().heatmapEnabled && event.target === canvas) {
        useModelStore.getState().toggleHeatmap(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [model, gl]);

  const [hoveredRisk, setHoveredRisk] = useState<DFMFaceRisk | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!model) return;
    const canvas = gl.domElement;
    const handleMouseMove = (event: MouseEvent) => {
      if (!model) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(model, true);
      if (intersects.length > 0) {
        const faceIndex = intersects[0].face?.a !== undefined ? Math.floor(intersects[0].faceIndex ?? -1) : -1;
        if (faceIndex !== -1 && Array.isArray(dfmRisks)) {
          const risk = dfmRisks.find(r => r.faceIndex === faceIndex);
          if (risk) {
            setHoveredRisk(risk);
            setTooltipPos({ x: event.clientX, y: event.clientY });
            return;
          }
        }
      }
      setHoveredRisk(null);
      setTooltipPos(null);
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [model, gl, camera, dfmRisks]);

  return (
    <>
      {model ? (
        <>
          {console.log('Rendering Model primitive:', model)}
          <primitive object={model} />
          {tooltipPos && hoveredRisk && (
            <Tippy
              content={
                <div style={{ minWidth: 180 }}>
                  <div className="font-semibold text-red-700">❗ {hoveredRisk.type.replace('_', ' ').toUpperCase()}</div>
                  {hoveredRisk.thickness && (
                    <div>Thickness: {hoveredRisk.thickness.toFixed(2)}mm</div>
                  )}
                  {hoveredRisk.recommendation && (
                    <div>Recommendation: {hoveredRisk.recommendation}</div>
                  )}
                  {hoveredRisk.impact && (
                    <div>Impact: <span className="font-bold">{hoveredRisk.impact}</span></div>
                  )}
                </div>
              }
              visible={true}
              interactive={false}
              placement="right"
              getReferenceClientRect={() => ({
                width: 0,
                height: 0,
                top: tooltipPos.y,
                left: tooltipPos.x,
                bottom: tooltipPos.y,
                right: tooltipPos.x,
                x: tooltipPos.x,
                y: tooltipPos.y,
                toJSON: () => ''
              })}
            >
              <div />
            </Tippy>
          )}
        </>
      ) : null}
    </>
  );
};