import { useModelStore } from '../store/modelStore';
import { 
  Home, 
  Maximize2, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Box, 
  Ruler, 
  Layers, 
  BoxIcon as Box3dIcon, 
  Edit, 
  MousePointer, 
  ArrowLeftRight as ArrowsUpDownLeftRight, 
  RotateCw, 
  Maximize, 
  Undo2, 
  Redo2, 
  SplitSquareHorizontal,
  Crosshair,
  Square,
  Flame,
  Wand2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVersionStore } from '../hooks/useVersionStore';
import { designRevisionAgent } from '../agents/designRevisionAgent';
import { useChatStore } from '../store/chatStore';
import { FloatingViewer } from './FloatingViewer';
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";
import { applyDFMHeatmap } from './Model';
import { analyzeDFMRisksPerFace } from '../functions/dfmRiskFunctions';
import { useDFMUIStore } from '../store/dfmUIStore';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  shortcut?: string;
}

const ToolbarButton = ({ 
  icon, 
  label, 
  isActive = false,
  onClick,
  disabled = false,
  shortcut
}: ToolbarButtonProps) => {
  return (
    <button 
      className={`p-2.5 rounded-lg relative group transition-all duration-200 ${
        disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
            : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
      }`}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      disabled={disabled}
    >
      <div>{icon}</div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
        {shortcut && <span className="ml-1 opacity-75">({shortcut})</span>}
      </div>
    </button>
  );
};

export const BottomToolbar = () => {
  // Use selectors for reactive state
  const dfmRisks = useModelStore(state => state.dfmRisks);
  const cadAnalysis = useModelStore(state => state.cadAnalysis);
  const setDFMRisks = useModelStore(state => state.setDFMRisks);
  const setCadAnalysisSummary = useModelStore(state => state.setCadAnalysisSummary);
  // Retain other destructured state as needed
  const { 
    viewerState, 
    setViewerMode,
    setTransformMode,
    resetCamera, 
    fitToView,
    toggleSectioning,
    toggleExploded,
    toggleMarkup,
    selectedParts,
    selectedMesh,
    undo,
    redo,
    canUndo,
    canRedo,
    setExplodeDistance,
    zoomIn,
    zoomOut,
    toggleAxes,
    heatmapEnabled,
    toggleHeatmap
  } = useModelStore();

  const { add } = useVersionStore();
  const { addMessage } = useChatStore();
  const { isDFMAnalysisOpen, closeDFMAnalysis } = useDFMUIStore();
  const [v2Mesh, setV2Mesh] = useState<any>(null);
  const [v2Summary, setV2Summary] = useState("");
  const [v2ChangeMap, setV2ChangeMap] = useState<Record<string, number[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [v2DFMRisks, setV2DFMRisks] = useState<any[]>([]);
  const [v2HeatmapEnabled, setV2HeatmapEnabled] = useState(false);

  const handleGenerateV2 = async () => {
    console.log("Generate V2 clicked", { selectedMesh });
    if (!selectedMesh || isGenerating) return;
    try {
      setIsGenerating(true);
      console.log("Starting V2 generation");

      // Clone and WELD the mesh before passing to agent
      const meshForV2 = selectedMesh.clone();
      // Weld geometry to ensure no fragmentation in V2
      if (meshForV2.geometry && meshForV2.geometry.isBufferGeometry) {
        meshForV2.geometry = mergeVertices(meshForV2.geometry);
      }

      // Call the design revision agent
      const { revisedMesh, summary, changeMap } = await designRevisionAgent(meshForV2);
      console.log("V2 generation completed", { revisedMesh, summary, changeMap });
      console.log('[DFM DEBUG] setV2ChangeMap', changeMap);
      setV2ChangeMap(changeMap);
      // Add debug: print changeMap in FloatingViewer
      setTimeout(() => {
        console.log('[DFM DEBUG] FloatingViewer changeMap prop', changeMap);
      }, 1000);

      // --- DEBUG: Brute-force geometry change for V2 test ---
      // (REMOVED: This was for pipeline testing only)

      // ---- DFM Heatmap for V2 ----
      // Remove old per-face DFM risk analysis for V2 mesh
      // Instead, use the changeMap returned from designRevisionAgent, which is already built from DFM analysis of the revised mesh

      setV2Mesh(revisedMesh); // <-- Ensure the revised mesh is set for preview
      setV2Summary(summary);
      setIsGenerating(false);

      // Add the revised mesh to the version store
      add("V2-AI", revisedMesh);

      // Send a message to the chat
      addMessage({
        type: 'assistant',
        content: `✅ V2 created with manufacturing improvements.\n\n${summary}`,
        id: Date.now().toString(),
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error generating V2:', error);
      addMessage({
        type: 'assistant',
        content: `❌ Failed to generate V2: ${error instanceof Error ? error.message : 'Unknown error'}`,
        id: Date.now().toString(),
        timestamp: new Date()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- DEBUG: Log DFM risks for toolbar button ---
  // Only declare dfmRisks ONCE in this component
  console.log('[DFM DEBUG] BottomToolbar dfmRisks:', dfmRisks);

  // --- DFM Heatmap button logic ---
  // The button should be enabled if DFM analysis is available (cadAnalysis && dfmRisks && dfmRisks.length > 0)
  const isDFMHeatmapEnabled = !!(cadAnalysis && dfmRisks && dfmRisks.length > 0);

  // Optionally show the legend popover when heatmap is active
  const [showDFMLegend, setShowDFMLegend] = useState(false);

  useEffect(() => {
    if (!heatmapEnabled && showDFMLegend) setShowDFMLegend(false);
  }, [heatmapEnabled, showDFMLegend]);

  // Prepare summary and changeMap for FloatingViewer
  const dfmSummary = cadAnalysis?.metadata?.gptSummary || '';
  const dfmChangeMap = Array.isArray(dfmRisks)
    ? dfmRisks.reduce((acc, risk) => {
        if (!acc[risk.type]) acc[risk.type] = [];
        acc[risk.type].push(risk.faceIndex);
        return acc;
      }, {} as Record<string, number[]>)
    : {};

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-3 py-2 border border-gray-200/50">
        <div className="flex items-center space-x-2">
          <ToolbarButton 
            icon={<Home size={20} />} 
            label="Reset View" 
            onClick={resetCamera}
          />
          <ToolbarButton 
            icon={<MousePointer size={20} />} 
            label="Select" 
            isActive={viewerState.mode === 'select' && viewerState.transformMode === 'none'}
            onClick={() => {
              setViewerMode('select');
              setTransformMode('none');
            }}
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton 
            icon={<Square size={20} />} 
            label="Orbit" 
            isActive={viewerState.mode === 'orbit' && viewerState.transformMode === 'none'}
            onClick={() => {
              setViewerMode('orbit');
              setTransformMode('none');
            }}
          />
          <ToolbarButton 
            icon={<ArrowsUpDownLeftRight size={20} />} 
            label="Move" 
            isActive={viewerState.transformMode === 'translate'}
            onClick={() => setTransformMode(
              viewerState.transformMode === 'translate' ? 'none' : 'translate'
            )}
            shortcut="M"
          />
          <ToolbarButton 
            icon={<RotateCw size={20} />} 
            label="Rotate" 
            isActive={viewerState.transformMode === 'rotate'}
            onClick={() => setTransformMode(
              viewerState.transformMode === 'rotate' ? 'none' : 'rotate'
            )}
          />
          <ToolbarButton 
            icon={<Maximize size={20} />} 
            label="Scale" 
            isActive={viewerState.transformMode === 'scale'}
            onClick={() => setTransformMode(
              viewerState.transformMode === 'scale' ? 'none' : 'scale'
            )}
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton 
            icon={<Ruler size={20} />} 
            label="Measure" 
            isActive={viewerState.mode === 'measure'}
            onClick={() => {
              setViewerMode('measure');
              setTransformMode('none');
            }}
          />
          <ToolbarButton 
            icon={<Layers size={20} />} 
            label="Section" 
            isActive={viewerState.isSectioningActive}
            onClick={toggleSectioning}
          />
          <ToolbarButton 
            icon={<SplitSquareHorizontal size={20} />} 
            label="Explode View" 
            isActive={viewerState.isExploded}
            onClick={toggleExploded}
          />
          <ToolbarButton 
            icon={<Edit size={20} />} 
            label="Markup" 
            isActive={viewerState.markupMode}
            onClick={toggleMarkup}
          />
          <ToolbarButton 
            icon={<Crosshair size={20} />} 
            label="Toggle Axes" 
            isActive={viewerState.showAxes}
            onClick={toggleAxes}
          />
          <ToolbarButton 
            icon={<Flame size={20} />} 
            label="DFM Heatmap" 
            isActive={heatmapEnabled}
            onClick={() => {
              if (isDFMHeatmapEnabled) {
                toggleHeatmap(!heatmapEnabled);
                setShowDFMLegend(!heatmapEnabled);
              } else {
                console.log('[DFM DEBUG] DFM Heatmap button disabled because no DFM risks are available.');
                alert("Heatmap unavailable. Please run DFM analysis first.");
              }
            }}
            disabled={!isDFMHeatmapEnabled}
          />
          {showDFMLegend && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50">
              {/* Lazy load to avoid circular import issues */}
              {require('./DFMLegend').DFMLegend()}
            </div>
          )}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton 
            icon={<Undo2 size={20} />} 
            label="Undo" 
            onClick={undo}
            disabled={!canUndo}
          />
          <ToolbarButton 
            icon={<Redo2 size={20} />} 
            label="Redo" 
            onClick={redo}
            disabled={!canRedo}
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton 
            icon={<Wand2 size={20} />} 
            label="Generate V2" 
            onClick={handleGenerateV2}
            disabled={!selectedMesh || isGenerating}
            isActive={isGenerating}
          />
        </div>

        {viewerState.isExploded && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white rounded-xl shadow-lg p-3 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Explode Distance</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={viewerState.explodeDistance}
              onChange={(e) => setExplodeDistance(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}
      </div>

      {isDFMAnalysisOpen && (
        <>
          {console.log('[DFM DEBUG] FloatingViewer props', {
            summary: dfmSummary,
            changeMap: dfmChangeMap,
            mesh: selectedMesh
          })}
          <FloatingViewer
            mesh={selectedMesh}
            onClose={closeDFMAnalysis}
            summary={dfmSummary}
            changeMap={dfmChangeMap}
            legend={['undercut', 'thin_wall', 'sharp_corner']}
            beforeMesh={selectedMesh}
          />
        </>
      )}
      {isDFMAnalysisOpen && console.log('[DFM DEBUG] FloatingViewer props', {
        selectedMesh,
        dfmSummary,
        dfmChangeMap,
        dfmRisks,
        cadAnalysis
      })}
    </>
  );
};