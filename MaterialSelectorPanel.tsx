// MaterialSelectorPanel.tsx
import React, { useState } from "react";
import { materialLibrary } from "../data/materialLibrary";
import { suggestMaterialForIntent } from "./gpt_functions/suggestMaterialForIntent";

export const MaterialSelectorPanel: React.FC = () => {
  const [selectedCategory, setCategory] = useState<string>("All");
  const [suggestion, setSuggestion] = useState<string>("");

  const filtered = selectedCategory === "All"
    ? materialLibrary
    : materialLibrary.filter((m) => m.category === selectedCategory);

  const handleSuggest = async () => {
    const intent = prompt("What is your design intent? (e.g., lightweight waterproof housing)");
    if (!intent) return;
    const result = await suggestMaterialForIntent({
      designIntent: intent,
      process: "Injection Molding",
      quantity: 1000,
      performanceNeeds: "",
      budgetPriority: "medium",
    });
    setSuggestion(result);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        {["All", "Plastic", "Metal", "Rubber", "Wood", "Composite", "3D Printing"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 text-sm rounded ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={handleSuggest}
          className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 rounded"
        >
          🧠 Suggest Based on Intent
        </button>
      </div>

      {suggestion && (
        <div className="bg-yellow-50 p-3 rounded text-sm whitespace-pre-wrap">
          <strong>🧠 GPT Suggestion:</strong>
          <div>{suggestion}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat, idx) => (
          <div key={idx} className="border p-3 rounded bg-white shadow-sm text-sm">
            <strong>{mat.name}</strong> <span className="text-gray-500">({mat.category})</span>
            <div>Subtypes: {mat.subtypes.join(", ")}</div>
            <div>Strength: {mat.properties.tensileStrength}</div>
            <div>Temp Resistance: {mat.properties.temperatureResistance}</div>
            <div>Processes: {mat.compatibleProcesses.join(", ")}</div>
            <div>Use Cases: {mat.bestFor.join(", ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
