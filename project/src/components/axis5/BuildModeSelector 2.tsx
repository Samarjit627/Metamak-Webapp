// components/BuildModeSelector.tsx
import React from "react";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";

export const BuildModeSelector: React.FC<{ partId: string }> = ({ partId }) => {
  const { updateMemory } = useMemoryEngine();

  const setMode = (mode: "prototype" | "production") => {
    updateMemory(partId, { buildMode: mode });
    alert(`Mode set to ${mode}. Axis5 will now tailor responses.`);
  };

  return (
    <div className="bg-gray-100 p-3 rounded flex gap-4 items-center text-sm">
      <span className="font-medium">🧭 What are you building?</span>
      <button
        onClick={() => setMode("prototype")}
        className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded"
      >
        🧪 Prototype
      </button>
      <button
        onClick={() => setMode("production")}
        className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded"
      >
        🏭 Mass Production
      </button>
    </div>
  );
};
