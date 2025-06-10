// hooks/useMemoryEngine.ts
import axios from "axios";

export const useMemoryEngine = () => {
  const baseURL = "/memory"; // adjust if using a backend proxy

  const initMemory = async (partId: string) => {
    try {
      const res = await axios.post(`${baseURL}/${partId}`);
      return res.data;
    } catch (err) {
      console.error("Memory init failed", err);
    }
  };

  const getMemory = async (partId: string) => {
    try {
      const res = await axios.get(`${baseURL}/${partId}`);
      return res.data;
    } catch (err) {
      console.error("Memory fetch failed", err);
    }
  };

  const updateMemory = async (partId: string, updates: Record<string, any>) => {
    try {
      const res = await axios.patch(`${baseURL}/${partId}`, updates);
      return res.data;
    } catch (err) {
      console.error("Memory update failed", err);
    }
  };

  // Helper shortcuts
  const saveDesignIntent = (partId: string, intent: string) =>
    updateMemory(partId, { designIntent: intent });

  const saveDFMFindings = (partId: string, dfmFindings: string[]) =>
    updateMemory(partId, { dfmFindings });

  const saveMaterialProcess = (partId: string, material: string, process: string) =>
    updateMemory(partId, { material, process });

  const saveManufacturabilityScore = (partId: string, score: number) =>
    updateMemory(partId, { manufacturabilityScore: score });

  const saveToleranceInsight = (
    partId: string,
    dimension: string,
    explanation: string
  ) => updateMemory(partId, {
    toleranceInsights: { [dimension]: explanation }
  });

  const saveAssemblyImpact = (partId: string, change: string, explanation: string) =>
    updateMemory(partId, {
      assemblyImpact: [{ change, explanation }]
    });

  const saveMaterialSuggestion = (partId: string, query: string, answer: string) =>
    updateMemory(partId, {
      suggestions: [{ type: "material", source: "AI", value: answer }]
    });

  return {
    initMemory,
    getMemory,
    updateMemory,
    saveDesignIntent,
    saveDFMFindings,
    saveMaterialProcess,
    saveManufacturabilityScore,
    saveToleranceInsight,
    saveAssemblyImpact,
    saveMaterialSuggestion,
  };
};
