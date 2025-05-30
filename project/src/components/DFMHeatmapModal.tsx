import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Center, Grid } from '@react-three/drei';
import OriginMarker from './OriginMarker';
import { useModelStore } from '../store/modelStore';
import { useDFMStore } from '../store/dfmStore';
import { useState, useRef } from 'react';
import * as THREE from 'three';
import { DFMLegend } from './DFMLegend';
import { motion, useDragControls } from 'framer-motion';


// Legend config (should match DFMLegend)
const dfmDescriptions = {
  thinWalls: 'Areas where material is too thin for reliable manufacturing. May warp or break during production.',
  undercuts: 'Features that prevent part removal from a mold in the primary pull direction.',
  sharpCorners: 'Corners with small radii that can cause stress concentration or tool wear.',
  lowDraft: 'Insufficient angle for easy part ejection from the mold.',
  smallHoles: 'Holes that are difficult to manufacture due to small diameter or high aspect ratio.',
  ribs: 'Thin supporting structures that may be difficult to fill or prone to warping.',
  bosses: 'Cylindrical features for mounting that may have sink marks or voids.',
  wallTransitions: 'Abrupt changes in wall thickness that can cause sink marks or warping.',
  sinkWarpage: 'Areas prone to surface depressions or warping due to uneven cooling.',
  closeFeatures: 'Features placed too close together for reliable manufacturing.',
  internalText: 'Text or details recessed into the part that may be difficult to produce.',
  ejection: 'Areas that may be difficult to eject from the mold.'
};
const dfmColors = {
  thinWalls:   '#fb8c00',
  undercuts:   '#e53935',
  sharpCorners:'#1976d2',
  lowDraft:    '#7b1fa2',
  smallHoles:  '#00897b',
  ribs:        '#fdd835',
  bosses:      '#8d6e63',
  wallTransitions:'#546e7a',
  sinkWarpage: '#d81b60',
  closeFeatures:'#43a047',
  internalText:'#5d4037',
  ejection:    '#f4511e'
};

const ALL = 'all';

function formatGptSummary(summary: string) {
  // Clean up summary: remove curly braces, quotes, stars, slashes, and literal \n
  let clean = summary
    .replace(/[{}"*]+/g, '') // remove curly braces, quotes, stars
    .replace(/\\n|\n|\r/g, '\n') // normalize all newlines
    .replace(/gptSummary:/g, '')
    .replace(/\s*\\/g, '') // remove stray slashes
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();

  // Split into lines and filter out empty lines
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  // Group lines into sections, splitting long lines into sentences
  const sections: { title: string, items: string[] }[] = [];
  let currentSection: { title: string, items: string[] } | null = null;
  const subSectionTitles = [
    'Part Features', 'Holes', 'Thin Walls', 'Sharp Corners', 'Recommendations'
  ];
  lines.forEach(line => {
    // Section headers (heuristic: ends with ':' or matches known headers)
    if (/^(DFM Analysis Results|Manufacturability Score|Severity|Features|Holes|Thin Walls|Sharp Corners|Recommendations|Part Features|Face \d+|Notes|Summary|Risks|Analysis):?$/i.test(line)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line.replace(/:$/, ''), items: [] };
    } else if (line) {
      // If current section is a sub-section, split into sub-items by '·', ';', or ':', else by sentences
      if (currentSection && subSectionTitles.includes(currentSection.title.trim())) {
        // Remove leading/trailing colons and split
        let subItems = line.split(/[·;]+/).map(s => s.trim()).filter(Boolean);
        // If still only one item, try splitting by ':', but skip if it's a Face/Feature
        if (subItems.length === 1 && subItems[0].includes(':')) {
          // Only split if not like 'Face 1: Diameter: 10mm'
          const trySplit = subItems[0].split(/(?<!Face \d|Sharp Corners|Thin Walls|Holes|Features): /).map(s => s.trim()).filter(Boolean);
          if (trySplit.length > 1) subItems = trySplit;
        }
        currentSection.items.push(...subItems);
      } else {
        // Default: split line into sentences by ". "
        const sentences = line.split(/\.\s+/).map(s => s.trim()).filter(Boolean);
        if (currentSection) currentSection.items.push(...sentences);
        else {
          // If no section, create a generic one
          currentSection = { title: '', items: sentences };
        }
      }
    }
  });
  if (currentSection) sections.push(currentSection);

  return sections;
}

function DFMAnalysisDescription() {
  // Get the V2 Generation (GPT) description from the store
  const cadAnalysis = useModelStore((s: any) => s.cadAnalysis);
  const summary = cadAnalysis?.metadata?.gptSummary;
  if (!summary) return null;
  const formatted = formatGptSummary(summary);

  // formatted is now an array of {title, items}
  return (
    <div className="mt-4 w-full bg-blue-50 border border-blue-200 rounded-lg p-4 shadow text-sm">
      <strong className="block mb-2 text-base text-blue-900">DFM Analysis Description</strong>
      <div className="text-blue-900">
        <ul className="list-disc list-inside ml-2">
          {formatted.map((section: { title: string; items: string[] }, idx: number) => {
            // Sections that should have sub-bullets
            const subSectionTitles = [
              'Part Features', 'Holes', 'Thin Walls', 'Sharp Corners', 'Recommendations'
            ];
            if (section.title && subSectionTitles.includes(section.title.trim())) {
              return (
                <li key={idx} className="font-semibold text-blue-800 text-sm mb-0.5">
                  {section.title}
                  <ul className="list-[\'-\'] ml-5 mt-0.5">
                    {section.items.map((item: string, i: number) => (
                      <li key={i} className="font-normal text-blue-900 leading-tight mb-0">{item}</li>
                    ))}
                  </ul>
                </li>
              );
            } else if (section.title) {
              // Main fact as bullet
              return (
                <li key={idx} className="font-normal text-blue-900 leading-tight mb-0">
                  {section.title}{section.items.length > 0 ? `: ${section.items[0]}` : ''}
                </li>
              );
            } else {
              // Items without section
              return section.items.map((item: string, i: number) => (
                <li key={idx + '-' + i} className="font-normal text-blue-900 leading-tight mb-0.5">{item}</li>
              ));
            }
          })}
        </ul>
      </div>
    </div>
  );
}

export default function DFMHeatmapModal() {
  const mesh = useModelStore((s) => s.selectedMesh);
  const dfmRisks = useDFMStore((s) => s.changeMap || []);
  const [hovered, setHovered] = useState<any>(null);
  const [activeType, setActiveType] = useState<string | null>(ALL);
  const [canvasKey, setCanvasKey] = useState(0); // for reset view
  const canvasRef = useRef<any>(null);

  // Filtered risks
  const shownRisks = activeType && activeType !== ALL
    ? dfmRisks.filter((r: any) => r.type === activeType)
    : dfmRisks;

  // Description for legend
  const legendDescription = activeType && activeType !== ALL
    ? dfmDescriptions[activeType] || ''
    : 'Showing all DFM risks detected on this part. Use the legend to filter and learn more about specific issues.';

  // Reset view handler
  const handleResetView = () => setCanvasKey((k) => k + 1);

  const dragControls = useDragControls();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        className="relative flex flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-[48vw] h-[85vh]"
        drag
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }}
        dragElastic={0.15}
        dragMomentum={false}
        style={{ touchAction: 'none' }}
      >
        {/* Close (cross) button */}
        <button
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-xl font-bold shadow focus:outline-none"
          onClick={() => (typeof window !== 'undefined' ? window.location.reload() : null)}
          title="Close"
          aria-label="Close DFM Analysis"
        >
          &times;
        </button>
        {/* Sidebar: DFM Analysis Description */}
        <div className="flex flex-col p-4 w-72 min-w-[210px] max-w-[250px] bg-blue-50 border-r border-gray-200 overflow-y-auto">
          <motion.strong
            className="block mb-4 text-xl text-blue-900 font-bold cursor-move select-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            DFM Analysis
          </motion.strong>
          <DFMAnalysisDescription />
        </div>
        {/* Main area: 3D viewer + legend + summary */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Top: 3D Viewer */}
          <div className="relative flex-1 flex flex-col items-center justify-center">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
                onClick={handleResetView}
              >
                Reset View
              </button>
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <Canvas
                key={canvasKey}
                camera={{ position: [0, 0, 40], fov: 30 }}
                ref={canvasRef}
                style={{ width: '100%', height: '60vh', background: '#f3f6fa', borderRadius: '1rem' }}
                onCreated={({ camera }) => {
                  // With <Center>, mesh is at [0,0,0] and scaled to fit unit cube, so set camera at a reasonable distance
                  camera.position.set(0, 0, 8);
                  camera.lookAt(0, 0, 0);
                }}
              >
                {/* Lighting for depth */}
                <ambientLight intensity={0.7} />
                <directionalLight position={[20, 40, 50]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.5} position={[0, 50, 0]} />
                <pointLight position={[-30, -30, 30]} intensity={0.5} />
                {/* Drei ContactShadows for subtle ground shadow */}
                <OrbitControls />
                {mesh && (
                  <Center>
                    <primitive object={mesh} />
                  </Center>
                )}
                {(shownRisks.length > 0 ? shownRisks : [
                  { type: 'sharpCorners', position: { x: 10, y: 0, z: 0 }, severity: 'high', message: 'Test Sharp Corner' },
                  { type: 'ribs', position: { x: -10, y: 0, z: 0 }, severity: 'medium', message: 'Test Rib' }
                ]).map((risk: any, idx: number) => {
                  const pos = new THREE.Vector3(
                    risk.position?.x || 0,
                    risk.position?.y || 0,
                    risk.position?.z || 0
                  );
                  return (
                    <mesh
                      key={idx}
                      position={pos}
                      onPointerOver={() => setHovered(risk)}
                      onPointerOut={() => setHovered(null)}
                    >
                      <sphereGeometry args={[1, 8, 8]} />
                      <meshStandardMaterial color={dfmColors[risk.type] || '#cccccc'} transparent opacity={0.7} />
                    </mesh>
                  );
                })}
                {hovered && (
                  <Html position={[hovered.position?.x || 0, hovered.position?.y || 0, hovered.position?.z || 0]}>
                    <div className="bg-white rounded shadow-md p-2 text-xs border border-gray-200 min-w-[120px]">
                      <b>{hovered.type && hovered.type.replace(/([A-Z])/g, ' $1').trim()}</b><br />
                      Severity: {hovered.severity}<br />
                      {hovered.message}
                    </div>
                  </Html>
                )}
              </Canvas>
            </div>
          </div>

          {/* DFM Risk Legend (filtered, vertical, engineering-aware) */}
          <div className="w-full flex flex-wrap items-center justify-center py-4 bg-white border-t border-b border-gray-200">
            <DFMLegend
              detectedTypes={Array.from(new Set(dfmRisks.map((r: any) => r.type)))}
              onHover={(type) => setActiveType(type === activeType ? ALL : type || ALL)}
              activeType={activeType === ALL ? null : activeType}
            />
          </div>

          {/* DFM Issues Summary (below legend) */}
          <div className="w-full flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-[900px] bg-white border border-gray-200 rounded-lg p-4 shadow text-sm">
              <strong className="block mb-2 text-base text-gray-800">DFM Issues Summary</strong>
              {dfmRisks.length === 0 && (
                <div className="text-red-500 mb-2">No DFM risks loaded. Showing sample overlay for demo.</div>
              )}
              {dfmRisks.length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(dfmRisks.reduce((acc: any, risk: any) => {
                    if (!acc[risk.type]) acc[risk.type] = [];
                    acc[risk.type].push(risk);
                    return acc;
                  }, {})).map(([type, risks]: [string, any[]]) => (
                    <li key={type} className="flex items-start gap-2">
                      <span className="mt-1 text-lg" style={{ color: dfmColors[type] }}>●</span>
                      <div>
                        <div className="font-medium capitalize">{type.replace(/([A-Z])/g, ' $1').trim()} <span className="text-xs text-gray-500">({risks.length})</span></div>
                        <div className="text-xs text-gray-600">{dfmDescriptions[type]}</div>
                        <ul className="ml-4 mt-1 list-disc text-xs text-gray-500">
                          {risks.map((r, i) => (
                            <li key={i}>{r.message}</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No real DFM risks to display. Please run analysis.</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
