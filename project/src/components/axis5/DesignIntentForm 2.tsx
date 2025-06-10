// components/DesignIntentForm.tsx
import React, { useState } from "react";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";

export const DesignIntentForm: React.FC<{ partId: string; onComplete?: () => void }> = ({ partId, onComplete }) => {
  const [intent, setIntent] = useState({
    application: "",
    function: "",
    aesthetic: "",
    volume: "Prototype",
    budget: "Medium",
    notes: "",
  });

  const { saveDesignIntent } = useMemoryEngine();

  const handleSubmit = () => {
    const summary = `\nDesign for: ${intent.application}\nFunctionality: ${intent.function}\nAesthetic: ${intent.aesthetic}\nVolume: ${intent.volume}\nBudget: ${intent.budget}\nNotes: ${intent.notes}\n    `;
    saveDesignIntent(partId, summary);
    alert("✅ Design intent saved. AI will now reason accordingly.");
    onComplete?.();
  }

  return (
    <div className="border p-4 rounded-md space-y-3 bg-white shadow-sm text-sm">
      <h3 className="font-semibold text-sm">🎯 Tell us about your design intent</h3>
      <input placeholder="Application area (e.g., Outdoor)" className="border p-1 w-full" onChange={e => setIntent({ ...intent, application: e.target.value })} />
      <input placeholder="Functional needs (e.g., heat resistance)" className="border p-1 w-full" onChange={e => setIntent({ ...intent, function: e.target.value })} />
      <input placeholder="Aesthetic (e.g., matte black, glossy)" className="border p-1 w-full" onChange={e => setIntent({ ...intent, aesthetic: e.target.value })} />
      <select className="border p-1 w-full" value={intent.volume} onChange={e => setIntent({ ...intent, volume: e.target.value })}>
        <option>Prototype</option>
        <option>Short Run</option>
        <option>Mass Production</option>
      </select>
      <select className="border p-1 w-full" value={intent.budget} onChange={e => setIntent({ ...intent, budget: e.target.value })}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <textarea placeholder="Other notes..." rows={2} className="border p-1 w-full" onChange={e => setIntent({ ...intent, notes: e.target.value })}></textarea>
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save Intent</button>
    </div>
  );
};
