import create from 'zustand';

interface DFMStoreState {
  changeMap: any[]; // Replace `any[]` with your actual risk type if you have one
  setChangeMap: (map: any[]) => void;
}

export const useDFMStore = create<DFMStoreState>((set) => ({
  changeMap: [],
  setChangeMap: (map) => set({ changeMap: map }),
}));
