// components/FixAgentPanel.tsx
import React, { useState } from "react";

export const FixAgentPanel: React.FC<{
  suggestions: string[];
  onApply: (accepted: string[]) => void;
}> = ({ suggestions, onApply }) => {
  const [accepted, setAccepted] = useState<boolean[]>(suggestions.map(() => true));

  const toggle = (index: number) => {
    const updated = [...accepted];
    updated[index] = !updated[index];
    setAccepted(updated);
  };

  const handleApply = () => {
    const selected = suggestions.filter((_, i) => accepted[i]);
    onApply(selected);
  };

  return (
    <div className="bg-yellow-50 border p-4 rounded-md text-sm space-y-3">
      <h3 className="font-semibold text-sm">🛠️ FixAgent Suggestions</h3>

      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <li
            key={i}
            className={`p-2 rounded border text-sm cursor-pointer ${
              accepted[i] ? "bg-green-50 border-green-400" : "bg-gray-100 border-gray-300"
            }`}
            onClick={() => toggle(i)}
          >
            {accepted[i] ? "✅" : "❌"} {s}
          </li>
        ))}
      </ul>

      <button
        onClick={handleApply}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded"
      >
        💡 Apply Selected Fixes in CAD Overlay
      </button>
    </div>
  );
};
