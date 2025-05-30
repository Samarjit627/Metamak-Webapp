import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BufferGeometry, Material, Vector3, OrbitControls, Group, Object3D, Box3, MeshStandardMaterial, Mesh } from 'three';
import { ViewerState } from '../types/viewer';
import { PartMetadata } from '../utils/extractPartMetadata';
import { DFMFaceRisk } from '../functions/dfmRiskFunctions';
import { useChatStore } from './chatStore';

interface ModelState {
  modelFile: File | null;
  pdfFile: File | null;
  fileName: string | null;
  fileType: 'obj' | 'stl' | 'step' | 'stp' | 'pdf' | null;
  selectedParts: Object3D[];
  selectedMesh: Mesh | null;
  selectedMaterial: 'metal' | 'plastic' | 'rubber' | 'wood';
  selectedMaterialSubtype: string;
  selectedMaterialGrade: string;
  selectedLocation: string;
  productionQuantity: number;
  bomItems: {
    partId: string;
    name: string;
    quantity: number;
    material: string;
    materialSubtype: string;
    materialGrade: string;
    process: string;
    estimatedCost: number;
    notes: string;
    location: string;
  }[];
  viewerState: ViewerState;
  controlsRef: OrbitControls | null;
  transformTarget: Group | null;
  materialState: {
    defaultMaterial: MeshStandardMaterial;
    highlightMaterial: MeshStandardMaterial;
  };
  cadAnalysis: {
    volume: number;
    surfaceArea: number;
    complexity: number;
    features: {
      thinWalls: { thickness: number; position: Vector3 }[];
      undercuts: { angle: number; depth: number }[];
      sharpCorners?: { angle: number; position: Vector3 }[];
    };
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    manufacturabilityScore: number;
    recommendedProcess?: string;
    metadata?: PartMetadata;
  } | null;
  currentGeometry: BufferGeometry | null;
  dfmRisks: DFMFaceRisk[];
  heatmapEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;

  setModelFile: (file: File | null) => void;
  setPdfFile: (file: File | null) => void;
  setFileName: (name: string | null) => void;
  setFileType: (type: 'obj' | 'stl' | 'step' | 'stp' | 'pdf' | null) => void;
  addSelectedPart: (part: Object3D) => void;
  removeSelectedPart: (part: Object3D) => void;
  clearSelectedParts: () => void;
  setSelectedMesh: (mesh: Mesh | null) => void;
  setSelectedMaterial: (material: 'metal' | 'plastic' | 'rubber' | 'wood') => void;
  setSelectedMaterialSubtype: (subtype: string) => void;
  setSelectedMaterialGrade: (grade: string) => void;
  setSelectedLocation: (location: string) => void;
  setProductionQuantity: (quantity: number) => void;
  setBomItems: (items: ModelState['bomItems']) => void;
  setViewerMode: (mode: ViewerState['mode']) => void;
  setTransformMode: (mode: ViewerState['transformMode']) => void;
  setControlsRef: (controls: OrbitControls | null) => void;
  setTransformTarget: (target: Group | null) => void;
  resetCamera: () => void;
  fitToView: () => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  toggleSectioning: () => void;
  toggleExploded: () => void;
  toggleMarkup: () => void;
  setExplodeDistance: (distance: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setCadAnalysis: (analysis: ModelState['cadAnalysis']) => void;
  setManufacturingMetadata: (data: {
    material: 'metal' | 'plastic' | 'rubber' | 'wood';
    materialSubtype: string;
    materialGrade: string;
    location: string;
    quantity: number;
  }) => void;
  setGeometry: (geometry: BufferGeometry | null) => void;
  setVolumeAndArea: (volume: number, surfaceArea: number) => void;
  setDFMRisks: (risks: DFMFaceRisk[]) => void;
  toggleHeatmap: (enabled: boolean) => void;
  undo: () => void;
  redo: () => void;
  setCadAnalysisSummary: (summary: string) => void;
}

const defaultMaterial = new MeshStandardMaterial({
  color: 0xc2e0f4,
  metalness: 0.4,
  roughness: 0.4,
  envMapIntensity: 1.5
});

const highlightMaterial = new MeshStandardMaterial({
  color: 0xaede65,
  metalness: 0.4,
  roughness: 0.3,
  emissive: 0xaede65,
  emissiveIntensity: 0.2,
  envMapIntensity: 1.5
});

export const useModelStore = create(
  persist<ModelState>(
    (set, get) => ({
      modelFile: null,
      pdfFile: null,
      fileName: null,
      fileType: null,
      selectedParts: [],
      selectedMesh: null,
      selectedMaterial: 'metal',
      selectedMaterialSubtype: 'aluminum',
      selectedMaterialGrade: '',
      selectedLocation: 'Ahmedabad',
      productionQuantity: 1000,
      bomItems: [],
      viewerState: {
        mode: 'orbit',
        transformMode: 'none',
        isGridVisible: true,
        showAxes: false,
        isSectioningActive: false,
        isExploded: false,
        explodeDistance: 1,
        markupMode: false,
        undercutWarnings: [],
        analysisPanel: {
          isCollapsed: true,
          position: { x: 20, y: 20 }
        }
      },
      controlsRef: null,
      transformTarget: null,
      materialState: {
        defaultMaterial,
        highlightMaterial
      },
      cadAnalysis: null,
      currentGeometry: null,
      dfmRisks: [],
      heatmapEnabled: false,
      canUndo: false,
      canRedo: false,

      setModelFile: (file) => {
        set({ modelFile: file });
        if (file) {
          useChatStore.getState().addMessage({
            type: 'assistant',
            content: 'Can you briefly tell me the functionality of this part and where it will be used? This will help me provide better manufacturing recommendations.',
            id: Date.now().toString(),
            timestamp: new Date()
          });
        }
      },
      setPdfFile: (file) => set({ pdfFile: file }),
      setFileName: (name) => set({ fileName: name }),
      setFileType: (type) => set({ fileType: type }),
      addSelectedPart: (part) => set(state => ({
        selectedParts: [...state.selectedParts, part]
      })),
      removeSelectedPart: (part) => set(state => ({
        selectedParts: state.selectedParts.filter(p => p !== part)
      })),
      clearSelectedParts: () => set({ selectedParts: [] }),
      setSelectedMesh: (mesh) => set({ selectedMesh: mesh }),
      setSelectedMaterial: (material) => set({ selectedMaterial: material }),
      setSelectedMaterialSubtype: (subtype) => set({ selectedMaterialSubtype: subtype }),
      setSelectedMaterialGrade: (grade) => set({ selectedMaterialGrade: grade }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      setProductionQuantity: (quantity) => set({ productionQuantity: quantity }),
      setBomItems: (items) => set({ bomItems: items }),
      setViewerMode: (mode) => set(state => ({
        viewerState: { ...state.viewerState, mode }
      })),
      setTransformMode: (mode) => set(state => ({
        viewerState: { ...state.viewerState, transformMode: mode }
      })),
      setControlsRef: (controls) => set({ controlsRef: controls }),
      setTransformTarget: (target) => set({ transformTarget: target }),
      resetCamera: () => {
        const { controlsRef } = get();
        if (controlsRef) {
          controlsRef.reset();
        }
      },
      fitToView: () => {
        const { controlsRef, selectedParts } = get();
        if (controlsRef && selectedParts.length > 0) {
          const box = new Box3();
          selectedParts.forEach(part => box.expandByObject(part));
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = controlsRef.object.fov * (Math.PI / 180);
          const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
          
          controlsRef.target.copy(center);
          controlsRef.object.position.copy(center);
          controlsRef.object.position.z += cameraDistance * 2;
          controlsRef.update();
        }
      },
      toggleGrid: () => set(state => ({
        viewerState: {
          ...state.viewerState,
          isGridVisible: !state.viewerState.isGridVisible
        }
      })),
      toggleAxes: () => set(state => ({
        viewerState: {
          ...state.viewerState,
          showAxes: !state.viewerState.showAxes
        }
      })),
      toggleSectioning: () => set(state => ({
        viewerState: {
          ...state.viewerState,
          isSectioningActive: !state.viewerState.isSectioningActive
        }
      })),
      toggleExploded: () => set(state => ({
        viewerState: {
          ...state.viewerState,
          isExploded: !state.viewerState.isExploded
        }
      })),
      toggleMarkup: () => set(state => ({
        viewerState: {
          ...state.viewerState,
          markupMode: !state.viewerState.markupMode
        }
      })),
      setExplodeDistance: (distance) => set(state => ({
        viewerState: {
          ...state.viewerState,
          explodeDistance: distance
        }
      })),
      zoomIn: () => {
        const { controlsRef } = get();
        if (controlsRef) {
          controlsRef.dollyIn(1.5);
          controlsRef.update();
        }
      },
      zoomOut: () => {
        const { controlsRef } = get();
        if (controlsRef) {
          controlsRef.dollyOut(1.5);
          controlsRef.update();
        }
      },
      setCadAnalysis: (analysis) => set({ cadAnalysis: analysis }),
      setManufacturingMetadata: (data) => set({
        selectedMaterial: data.material,
        selectedMaterialSubtype: data.materialSubtype,
        selectedMaterialGrade: data.materialGrade,
        selectedLocation: data.location,
        productionQuantity: data.quantity
      }),
      setGeometry: (geometry) => set({ currentGeometry: geometry }),
      setVolumeAndArea: (volume, surfaceArea) => set(state => ({
        cadAnalysis: state.cadAnalysis ? {
          ...state.cadAnalysis,
          volume,
          surfaceArea
        } : null
      })),
      setDFMRisks: (risks) => {
        console.log('setDFMRisks called with:', risks);
        set({ dfmRisks: risks });
      },
      toggleHeatmap: (enabled) => set({ heatmapEnabled: enabled }),
      undo: () => {
        // Placeholder for undo functionality
        set({ canUndo: false });
      },
      redo: () => {
        // Placeholder for redo functionality
        set({ canRedo: false });
      },
      setCadAnalysisSummary: (summary) => set(state => ({
        cadAnalysis: state.cadAnalysis
          ? {
              ...state.cadAnalysis,
              metadata: {
                ...(state.cadAnalysis.metadata || {}),
                gptSummary: summary
              }
            }
          : {
              // Create a minimal cadAnalysis object if missing
              volume: 0,
              surfaceArea: 0,
              complexity: 0,
              features: { thinWalls: [], undercuts: [], sharpCorners: [] },
              dimensions: { width: 0, height: 0, depth: 0 },
              manufacturabilityScore: 0,
              metadata: { gptSummary: summary }
            }
      })),
    }),
    {
      name: 'model-storage',
      partialize: (state) => ({
        fileName: state.fileName,
        fileType: state.fileType,
        selectedMaterial: state.selectedMaterial,
        selectedMaterialSubtype: state.selectedMaterialSubtype,
        selectedMaterialGrade: state.selectedMaterialGrade,
        selectedLocation: state.selectedLocation,
        productionQuantity: state.productionQuantity,
        bomItems: state.bomItems,
        cadAnalysis: state.cadAnalysis,
        dfmRisks: state.dfmRisks,
        viewerState: {
          ...state.viewerState,
          mode: 'orbit',
          transformMode: 'none'
        }
      })
    }
  )
);