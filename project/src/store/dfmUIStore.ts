import create from 'zustand';
import { useModelStore } from '../store/modelStore';

interface DFMUIState {
  isDFMHeatmapOpen: boolean;
  isDFMAnalysisOpen: boolean;
  openDFMAnalysis: () => void;
  closeDFMAnalysis: () => void;
}

export const useDFMUIStore = create<DFMUIState>((set) => ({
  isDFMHeatmapOpen: false,
  isDFMAnalysisOpen: false,
  openDFMAnalysis: () => {
    useModelStore.getState().toggleHeatmap(true); // Enable overlay
    set({ isDFMHeatmapOpen: true, isDFMAnalysisOpen: true });
  },
  closeDFMAnalysis: () => {
    useModelStore.getState().toggleHeatmap(false); // Disable overlay
    set({ isDFMHeatmapOpen: false, isDFMAnalysisOpen: false });
  },
}));
