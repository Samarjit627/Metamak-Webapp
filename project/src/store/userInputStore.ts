import { create } from 'zustand';

interface UserInputState {
  material: string;
  materialSubtype: string;
  grade: string;
  application: string;
  location: string;
  quantity: number;
  setMaterial: (material: string) => void;
  setMaterialSubtype: (subtype: string) => void;
  setGrade: (grade: string) => void;
  setApplication: (application: string) => void;
  setLocation: (location: string) => void;
  setQuantity: (quantity: number) => void;
  setAllInputs: (inputs: Partial<UserInputState>) => void;
}

export const useUserInputStore = create<UserInputState>((set) => ({
  material: 'metal',
  materialSubtype: 'aluminum',
  grade: '',
  application: '',
  location: 'Ahmedabad',
  quantity: 1000,
  setMaterial: (material) => set({ material }),
  setMaterialSubtype: (materialSubtype) => set({ materialSubtype }),
  setGrade: (grade) => set({ grade }),
  setApplication: (application) => set({ application }),
  setLocation: (location) => set({ location }),
  setQuantity: (quantity) => set({ quantity }),
  setAllInputs: (inputs) => set((state) => ({ ...state, ...inputs }))
}));