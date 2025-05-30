import { useModelStore } from '../store/modelStore';
import { useUserInputStore } from '../store/userInputStore';

export const getSelectedPart = async () => {
  const { selectedParts } = useModelStore.getState();
  return selectedParts[0] || null;
};

export const getVolume = (part: any) => {
  const { cadAnalysis } = useModelStore.getState();
  return cadAnalysis?.volume || 100;
};

export const getComplexityScore = (part: any) => {
  const { cadAnalysis } = useModelStore.getState();
  return cadAnalysis?.complexity || 0.5;
};

export const getDimensions = (part: any) => {
  const { cadAnalysis } = useModelStore.getState();
  return cadAnalysis?.dimensions || {
    width: 100,
    height: 100,
    depth: 100
  };
};

export const getMaterialInfo = () => {
  const { 
    material: type,
    materialSubtype: subtype,
    grade
  } = useUserInputStore.getState();

  return {
    type,
    subtype,
    grade
  };
};

export const getManufacturingParams = () => {
  const {
    location,
    quantity
  } = useUserInputStore.getState();

  return {
    location,
    quantity
  };
};