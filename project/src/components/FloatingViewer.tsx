import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
// @ts-ignore
import Draggable from "react-draggable";
import ReactTooltip from "react-tooltip";
import { DFMLegend } from "./DFMLegend";

interface Props {
  mesh: THREE.Mesh;
  onClose: () => void;
  position?: "left" | "right";
  changeMap?: Record<string, number[]>; // {fixType: [face indices]}
  summary?: string;
  legend?: string[];
  beforeMesh?: THREE.Mesh;
}

// --- Utility: Map legend keys to changeMap keys ---
function legendKeyToChangeMapKey(key: string | null): string | null {
  if (!key) return null;
  // Normalize legend keys to changeMap keys
  switch (key) {
    case 'thin_wall': return 'thinWalls';
    case 'sharp_corner': return 'sharpCorners';
    case 'undercut': return 'undercuts';
    default: return key;
  }
}

export default function FloatingViewer({ mesh, onClose, position = "left", changeMap = {}, summary = "", legend = [], beforeMesh }: Props) {
  console.log('[DFM DEBUG] FloatingViewer received summary:', summary);
  console.log('[DFM DEBUG] FloatingViewer received changeMap:', changeMap);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const [highlightType, setHighlightType] = useState<string | null>(null);
  const [hoveredLegendItem, setHoveredLegendItem] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // --- DEBUG: Log changeMap and geometry state ---
  useEffect(() => {
    if (!mesh) return;
    const geom = mesh.geometry as THREE.BufferGeometry;
    console.log('[DFM DEBUG] FloatingViewer: changeMap', changeMap);
    console.log('[DFM DEBUG] FloatingViewer: geometry', {
      hasIndex: !!geom.index,
      positionCount: geom.attributes.position.count,
      indexCount: geom.index ? geom.index.count : 0
    });
  }, [mesh, changeMap]);

  // --- DEBUG: Log legend, highlightType, effectiveHighlightKey, and changeMap on each render ---
  useEffect(() => {
    const legendItems = legend.length > 0 ? legend : Object.keys(changeMap);
    console.log('[DFM DEBUG] legendItems:', legendItems);
    console.log('[DFM DEBUG] highlightType:', highlightType);
    console.log('[DFM DEBUG] hoveredLegendItem:', hoveredLegendItem);
    const effectiveHighlightType = hoveredLegendItem ?? highlightType;
    const effectiveHighlightKey = legendKeyToChangeMapKey(effectiveHighlightType);
    console.log('[DFM DEBUG] effectiveHighlightKey:', effectiveHighlightKey);
    console.log('[DFM DEBUG] changeMap:', changeMap);
  });

  /** initialise once */
  useEffect(() => {
    if (!wrapRef.current || !mesh) return;

    /* Renderer */
    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rendererRef.current.setSize(360, 360); // 20% larger
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
    }
    const r = rendererRef.current;

    /* Scene & Camera */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    sceneRef.current = scene;
    cameraRef.current = camera;

    /* Clone the mesh so we don't mutate main scene */
    const model = (showBefore && beforeMesh) ? beforeMesh.clone() : mesh.clone();
    if (model && model.isMesh) {
      model.material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        vertexColors: true,
        metalness: 0.3,
        roughness: 0.6,
      });
      model.material.needsUpdate = true;
    }
    scene.add(model);

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 2, 4);
    scene.add(dir);

    /* Frame object */
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const ctr = box.getCenter(new THREE.Vector3());
    camera.position.copy(ctr).add(new THREE.Vector3(size, size, size));
    camera.lookAt(ctr);

    /* OrbitControls */
    controlsRef.current = new OrbitControls(camera, r.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.target.copy(ctr);
    controlsRef.current.update();

    /* animation loop */
    function animate() {
      requestAnimationFrame(animate);
      controlsRef.current?.update();
      r.render(scene, camera);
    }
    animate();

    /* cleanup */
    return () => {
      controlsRef.current?.dispose();
      scene.clear();
      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        rendererRef.current = undefined;
      }
    };
  // eslint-disable-next-line
  }, [mesh, showBefore, beforeMesh]);

  useEffect(() => {
    if (!wrapRef.current || !rendererRef.current) return;
    const container = wrapRef.current;
    const renderer = rendererRef.current;
    // Remove only the renderer's canvas if it's present
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
    // Append renderer's canvas
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "360px";
    renderer.domElement.style.height = "360px";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.margin = "auto";
  }, [rendererRef.current]);

  useEffect(() => {
    if (!wrapRef.current || !mesh) return;
    const r = rendererRef.current;
    if (!r) return;
    // Find the model in the scene
    const scene = sceneRef.current;
    if (!scene) return;
    // Log all scene children
    console.log('[DFM DEBUG] Scene children:', scene.children.map(obj => obj.type));
    const model = scene.children.find(obj => obj.type === 'Mesh') as THREE.Mesh | undefined;
    if (!model) return;
    const geom = model.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position;
    const isIndexed = !!geom.index;
    // DEBUG: Log material type and vertexColors
    console.log('[DFM DEBUG] Material type:', (model.material as any).type, 'vertexColors:', (model.material as any).vertexColors);
    // --- Ensure geometry is ready for raycasting ---
    geom.computeBoundingSphere();
    geom.computeVertexNormals();
    // --- Force mesh to be double-sided for raycasting ---
    (model.material as any).side = THREE.DoubleSide;

    // --- UPDATED COLOR MAPPING ---
    const colorMap: Record<string, [number, number, number]> = {
      thinWalls: [0, 1, 0.2],      // Neon green
      sharpCorners: [1, 0.6, 0],   // Orange
      undercuts: [1, 0, 1],        // Magenta
      default: [0.90, 0.94, 0.98], // Light blue
      debug: [1, 0, 0.5]           // Hot pink (for debug)
    };

    // Build a face index -> type map for quick lookup
    const faceTypeMap: Record<number, string> = {};
    if (changeMap) {
      Object.keys(changeMap).forEach(type => {
        console.log(`[DFM DEBUG] changeMap[${type}]:`, changeMap[type]);
        changeMap[type]?.forEach((faceIdx: number) => {
          faceTypeMap[faceIdx] = type;
        });
      });
    }
    console.log('[DFM DEBUG] faceTypeMap:', faceTypeMap);

    const effectiveHighlightType = hoveredLegendItem ?? highlightType;
    const effectiveHighlightKey = legendKeyToChangeMapKey(effectiveHighlightType);
    console.log('[DFM DEBUG] Coloring faces for effectiveHighlightKey:', effectiveHighlightKey);

    const colorAttr = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
    for (let i = 0; i < pos.count; i += 3) {
      const faceIdx = i / 3;
      let color: [number, number, number];
      if (!effectiveHighlightKey) {
        // Show All: color each DFM type with its color, others default
        if (faceTypeMap[faceIdx]) {
          color = colorMap[faceTypeMap[faceIdx]] || colorMap.default;
        } else {
          color = colorMap.default;
        }
      } else {
        // Only highlight selected type, others default
        if (faceTypeMap[faceIdx] === effectiveHighlightKey) {
          color = colorMap[effectiveHighlightKey] || colorMap.default;
        } else {
          color = colorMap.default;
        }
      }
      for (let j = 0; j < 3; j++) {
        colorAttr.setXYZ(i + j, ...color);
      }
      if (faceIdx % 1000 === 0) console.log(`[DFM DEBUG] Setting face ${faceIdx} color:`, color, 'type:', faceTypeMap[faceIdx]);
    }
    geom.setAttribute('color', colorAttr);
    geom.attributes.color.needsUpdate = true;
    if (model.material) {
      (model.material as THREE.Material).vertexColors = true;
      (model.material as any).color = undefined;
      (model.material as any).needsUpdate = true;
    }
    console.log('[DFM DEBUG] Finished setting face colors');
  }, [mesh, sceneRef, hoveredLegendItem, highlightType, changeMap]);

  // --- Restore face highlight logic and hover tooltip for DFM issues ---
  useEffect(() => {
    const r = rendererRef.current;
    if (!r || !wrapRef.current) return;
    const domEl = r.domElement;
    const handlePointerMove = (event: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current || !mesh) return;
      const rect = domEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const pointer = new THREE.Vector2(
        (x / rect.width) * 2 - 1,
        -(y / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, cameraRef.current);
      // Log the object being raycasted
      console.log('[DFM DEBUG] Raycasting object:', sceneRef.current.children[0]?.type, sceneRef.current.children[0]);
      const intersects = raycaster.intersectObject(sceneRef.current.children[0], false);
      // DEBUG: Log raycasting result
      console.log('[DFM DEBUG] Raycast intersects:', intersects);
      if (intersects.length > 0) {
        const faceIdx = intersects[0].faceIndex;
        let foundType: string | null = null;
        let tooltipContent = '';
        if (changeMap && faceIdx !== undefined) {
          // Find all DFM types for this face
          const types = Object.keys(changeMap).filter(type => changeMap[type]?.includes(faceIdx));
          if (types.length > 0) {
            foundType = types[0];
            tooltipContent = `Type: ${foundType}\nFace: ${faceIdx}`;
          }
        }
        if (foundType) {
          setTooltip({ x, y, content: tooltipContent });
        } else {
          setTooltip(null);
        }
      } else {
        setTooltip(null);
      }
    };
    domEl.addEventListener('pointermove', handlePointerMove);
    domEl.addEventListener('mouseleave', () => setTooltip(null));
    return () => {
      domEl.removeEventListener('pointermove', handlePointerMove);
      domEl.removeEventListener('mouseleave', () => setTooltip(null));
    };
  }, [changeMap, mesh, sceneRef, cameraRef]);

  // --- Marker creation for thin wall debugging ---
  useEffect(() => {
    if (!mesh || !sceneRef.current) return;
    const geom = mesh.geometry as THREE.BufferGeometry;
    const effectiveHighlightType = hoveredLegendItem ?? highlightType;
    const highlightKey = legendKeyToChangeMapKey('thin_wall');
    const faces = changeMap[highlightKey ?? 'thinWalls'] || [];
    // Remove old markers if any
    sceneRef.current.children = sceneRef.current.children.filter(child => !child.userData?.dfmThinWallMarker);
    // Only show spheres if thin wall is actively selected/hovered
    if (effectiveHighlightType !== 'thin_wall' && effectiveHighlightType !== 'thinWalls') return;
    if (faces.length === 0) return;
    // Helper to create a marker sphere
    const createMarker = (centroid: number[]) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff00ff })
      );
      marker.position.set(centroid[0], centroid[1], centroid[2]);
      marker.userData.dfmThinWallMarker = true;
      if (sceneRef.current) {
        sceneRef.current.add(marker);
        console.log('[DFM DEBUG] Marker added at centroid:', centroid);
      } else {
        console.warn('[DFM DEBUG] sceneRef.current not found, cannot add marker');
      }
    };
    if (!geom.index) {
      // Non-indexed geometry
      const pos = geom.attributes.position;
      for (const faceIdx of faces) {
        const vA = [pos.getX(faceIdx * 3), pos.getY(faceIdx * 3), pos.getZ(faceIdx * 3)];
        const vB = [pos.getX(faceIdx * 3 + 1), pos.getY(faceIdx * 3 + 1), pos.getZ(faceIdx * 3 + 1)];
        const vC = [pos.getX(faceIdx * 3 + 2), pos.getY(faceIdx * 3 + 2), pos.getZ(faceIdx * 3 + 2)];
        const centroid = [
          (vA[0] + vB[0] + vC[0]) / 3,
          (vA[1] + vB[1] + vC[1]) / 3,
          (vA[2] + vB[2] + vC[2]) / 3,
        ];
        createMarker(centroid);
      }
    } else {
      // Indexed geometry
      const pos = geom.attributes.position;
      const idx = geom.index;
      for (const faceIdx of faces) {
        const a = idx.getX(faceIdx * 3);
        const b = idx.getX(faceIdx * 3 + 1);
        const c = idx.getX(faceIdx * 3 + 2);
        const vA = [pos.getX(a), pos.getY(a), pos.getZ(a)];
        const vB = [pos.getX(b), pos.getY(b), pos.getZ(b)];
        const vC = [pos.getX(c), pos.getY(c), pos.getZ(c)];
        const centroid = [
          (vA[0] + vB[0] + vC[0]) / 3,
          (vA[1] + vB[1] + vC[1]) / 3,
          (vA[2] + vB[2] + vC[2]) / 3,
        ];
        createMarker(centroid);
      }
    }
  }, [mesh, changeMap, legend, highlightType, hoveredLegendItem]);

  // --- Ensure renderer and camera fit the container and center the model ---
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !mesh) return;
    const container = wrapRef.current;
    const renderer = rendererRef.current;
    if (!container) return;
    // 1. Resize renderer to container
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    // 2. Center and fit model
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // Move camera back enough to see the whole model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.2;
    cameraRef.current.position.set(center.x, center.y, center.z + cameraZ);
    cameraRef.current.lookAt(center);
    cameraRef.current.updateProjectionMatrix();
    // Center controls if used
    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [mesh]);

  /* export OBJ */
  function handleExport() {
    if (!mesh) return;
    const exporter = new OBJExporter();
    const objText = exporter.parse(mesh);
    const blob = new Blob([objText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${mesh.name || "part"}_v2.obj`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Legend and highlight toggles
  const legendItems = legend.length > 0 ? legend : Object.keys(changeMap);

  return (
    <Draggable handle=".drag-handle">
      <div
        style={{
          position: "fixed",
          top: "40%",
          left: position === "left" ? "20%" : undefined,
          right: position === "right" ? "20%" : undefined,
          transform: "translate(-60%, -120%)",
          width: 360,
          height: 420,
          background: "#fff",
          border: "1.5px solid #bbb",
          zIndex: 9999,
          borderRadius: 12,
          color: "#333",
          boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
          userSelect: "none",
          resize: "both",
          overflow: "hidden"
        }}
      >
        <div className="drag-handle" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", fontSize: 16, background: "#f8f8f8", borderBottom: "1px solid #eee", borderRadius: "12px 12px 0 0", cursor: "move" }}>
          <span style={{ fontWeight: 600 }}>DFM Analysis</span>
          <div>
            <button onClick={handleExport} style={{ marginRight: 10, background: "transparent", color: "#3b82f6", border: "none", cursor: "pointer" }} title="Export OBJ">⤓</button>
            <button onClick={onClose} style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer" }} title="Close">×</button>
          </div>
        </div>
        {/* DEBUG: Show summary and changeMap for troubleshooting */}
        <div style={{background:'#ffe',padding:'8px',margin:'8px 0',border:'1px solid #fc0',color:'#444',fontSize:13}}>
          <div><b>DEBUG Summary:</b> {summary || <i>(empty)</i>}</div>
          <div><b>DEBUG ChangeMap:</b> {Object.keys(changeMap).length === 0 ? <i>(empty)</i> : (
            <ul>
              {Object.entries(changeMap).map(([type, faces]) => (
                <li key={type}>{type}: {faces.length} faces</li>
              ))}
            </ul>
          )}</div>
        </div>
        <div ref={wrapRef} style={{ width: "100%", height: 360, minHeight: 360, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          {/* Three.js renderer's canvas will be appended here dynamically, fixed size */}
          {tooltip && (
            <div style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              background: "#222",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 13,
              pointerEvents: "none",
              zIndex: 10000,
              border: "2px solid #ff0"
            }}>
              {tooltip.content.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "8px 14px", maxHeight: 110, overflowY: "auto", borderTop: "1px solid #eee", background: "#fcfcfc" }}>
          <div style={{ marginBottom: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowBefore(v => !v)} style={{ fontSize: 13, padding: "3px 9px", borderRadius: 6, border: "1px solid #aaa", background: showBefore ? "#e0e7ff" : "#f3f4f6", color: "#444", marginRight: 8 }}>Show {showBefore ? "V2" : "Original"}</button>
            {legendItems.map(type => (
              <button
                key={type}
                onMouseOver={() => setHoveredLegendItem(type)}
                onMouseOut={() => setHoveredLegendItem(null)}
                onClick={() => {
                  console.log('[DFM DEBUG] Legend button clicked, setting highlightType:', type);
                  setHighlightType(type);
                }}
                style={{ fontSize: 13, padding: "3px 9px", borderRadius: 6,
                  border: (highlightType === type || hoveredLegendItem === type) ? "2px solid #f59e42" : "1px solid #aaa",
                  background: (highlightType === type || hoveredLegendItem === type) ? "#fef3c7" : "#f3f4f6", color: "#555", marginRight: 4 }}
              >
                {type}
              </button>
            ))}
            <button onClick={() => {
              console.log('[DFM DEBUG] Show All clicked, clearing highlightType');
              setHighlightType(null);
            }} style={{ fontSize: 13, padding: "3px 9px", borderRadius: 6, border: !highlightType ? "2px solid #aaa" : "1px solid #aaa", background: !highlightType ? "#e0e7ff" : "#f3f4f6", color: "#444" }}>Show All</button>
          </div>
          <ul style={{ fontSize: 14, margin: 0, paddingLeft: 18, color: "#222", listStyleType: 'disc' }}>
            {Object.entries(changeMap).filter(([, arr]) => arr && arr.length > 0).map(([type, arr], i) => (
              <li key={i}>
                <b>{type}</b>: {arr.length} region{arr.length > 1 ? "s" : ""}
              </li>
            ))}
            {summary.split(/\n|\r|•/).map(line => line.trim()).filter(Boolean).map((line, i) => (
              <li key={"s" + i}>{line}</li>
            ))}
          </ul>
          <div style={{ marginTop: 10, fontSize: 13, color: "#666", textAlign: "center" }}>
            Tip: Click a legend button to highlight specific changes. Scroll to see all changes.
          </div>
        </div>
        {/* DFM Legend Integration */}
        <div style={{ position: "absolute", right: "-280px", top: 0, zIndex: 1000 }}>
          <DFMLegend onHover={setHoveredLegendItem} activeType={highlightType} />
        </div>
      </div>
    </Draggable>
  );
}

export { FloatingViewer };