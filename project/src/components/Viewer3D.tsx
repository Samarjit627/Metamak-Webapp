import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Model } from './Model';
import { useModelStore } from '../store/modelStore';
import { FileUpload } from './FileUpload';
import { SurfaceAnalysis } from './SurfaceAnalysis';
import { useModelLoader } from '../hooks/useModelLoader';
import { CoordinateAxes } from './CoordinateAxes';
import { AIRecommendationsButton } from './AIRecommendationsButton';
import { SidePanel } from './SidePanel';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { PDFViewer } from './PDFViewer';
import { DFMLegend } from './DFMLegend';
import { BottomToolbar } from './BottomToolbar';
import * as THREE from 'three';
import { DFMFaceRisk } from '../functions/dfmRiskFunctions';

export function applyDFMHeatmap(
  mesh: THREE.Mesh,
  geometry: THREE.BufferGeometry,
  dfmRisks: DFMFaceRisk[]
) {
  const heatmapEnabled = useModelStore.getState().heatmapEnabled;
  if (!heatmapEnabled || !geometry.attributes.position) return;

  const colorArray: number[] = [];
  const faceCount = geometry.attributes.position.count / 3;
  const defaultColor = new THREE.Color(0.8, 0.8, 0.8); // Light gray base color

  const colorMap = {
    undercut: new THREE.Color(1, 0, 0),        // Red
    thin_wall: new THREE.Color(1, 1, 0),       // Yellow
    sharp_corner: new THREE.Color(1, 0.5, 0)   // Orange
  };

  for (let i = 0; i < faceCount; i++) {
    const match = dfmRisks.find(r => r.faceIndex === i);
    let color = defaultColor;

    if (match) {
      const baseColor = colorMap[match.type];
      const score = match.riskScore ?? 0.5;
      color = defaultColor.clone().lerp(baseColor, score);
    }

    for (let j = 0; j < 3; j++) {
      colorArray.push(color.r, color.g, color.b);
    }
  }

  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colorArray, 3)
  );

  if (mesh.material instanceof THREE.Material) {
    mesh.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.4,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    mesh.material.needsUpdate = true;
  }
}

const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
      <div className="mt-4 text-sm text-gray-600">Loading scene...</div>
    </div>
  </div>
);

const Scene = () => {
  const { 
    viewerState, 
    setViewerMode, 
    resetCamera, 
    fitToView, 
    toggleGrid,
    toggleAxes 
  } = useModelStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setViewerMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewerMode]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      
      <Model />
      
      {viewerState.showAxes && <CoordinateAxes />}
      
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#d1d5db"
        sectionSize={5}
        position={[0, -0.01, 0]}
        receiveShadow
        visible={viewerState.isGridVisible}
      />
      
      <OrbitControls 
        makeDefault
        enabled={viewerState.mode === 'orbit' && viewerState.transformMode === 'none'}
        minDistance={2}
        maxDistance={50}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        enableZoom={viewerState.mode === 'zoom'}
        enablePan={false}
        enableRotate={viewerState.mode === 'orbit' && viewerState.transformMode === 'none'}
      />
    </>
  );
};

export const Viewer3D = () => {
  const { modelFile, pdfFile, heatmapEnabled } = useModelStore();
  const [showAIPanel, setShowAIPanel] = useState(false);

  const cameraSettings = useMemo(() => ({
    fov: 45,
    near: 0.1,
    far: 1000
  }), []);

  const glSettings = useMemo(() => ({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  }), []);

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf') {
      useModelStore.getState().setPdfFile(file);
      useModelStore.getState().setFileType('pdf');
    } else {
      useModelStore.getState().setModelFile(file);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-lg font-semibold text-gray-800 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          {pdfFile ? 'PDF View' : 'CAD View'}
        </h2>
      </div>
      
      <AIRecommendationsButton onClick={() => setShowAIPanel(true)} />
      <SurfaceAnalysis />
      
      {/* Centered Upload Area */}
      {!modelFile && !pdfFile && (
        <div className="absolute inset-0 z-10 pointer-events-auto">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full">
            <FileUpload 
              accept=".obj,.stl,.step,.stp,.pdf"
              onFileSelect={handleFileUpload}
            />
          </div>
        </div>
      )}
      
      <div className="absolute inset-0">
        {pdfFile ? (
          <PDFViewer 
            file={pdfFile} 
            onClose={() => {
              useModelStore.getState().setPdfFile(null);
              useModelStore.getState().setFileType(null);
            }} 
          />
        ) : (
          <Canvas
            shadows
            dpr={[1, 1.5]}
            gl={glSettings}
            camera={cameraSettings}
            performance={{ min: 0.5 }}
          >
            <color attach="background" args={['#f5f5f7']} />
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        )}
      </div>

      {heatmapEnabled && <DFMLegend />}

      <Suspense fallback={<LoadingSpinner />}>
        <div className="absolute inset-0 pointer-events-none" />
      </Suspense>

      <SidePanel isOpen={showAIPanel} onClose={() => setShowAIPanel(false)}>
        <AIRecommendationsPanel onClose={() => setShowAIPanel(false)} />
      </SidePanel>

      {/* Always show BottomToolbar at the bottom of the viewer */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center pb-4 pointer-events-none z-30">
        <div className="pointer-events-auto">
          <BottomToolbar />
        </div>
      </div>
    </div>
  );
}