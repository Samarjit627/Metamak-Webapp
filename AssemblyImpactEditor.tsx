// Axis5 Feature: Assembly Impact Manual Editor UI
import React, { useState } from "react";
import { checkAssemblyImpact } from "@/gpt_functions/checkAssemblyImpact";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";

interface AssemblyImpactEditorProps {
  partId: string;
}

export const AssemblyImpactEditor: React.FC<AssemblyImpactEditorProps> = ({ partId }) => {
  const [form, setForm] = useState({
    changedFeature: "",
    matingPartInfo: "",
    fitType: "press fit",
    originalClearance: "",
    newGeometryContext: "",
  });
  const [result, setResult] = useState<string>("");
  const { saveAssemblyImpact } = useMemoryEngine();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheck = async () => {
    const impact = await checkAssemblyImpact(form);
    setResult(impact);
    saveAssemblyImpact(partId, form.changedFeature, impact);
  };

  return (
    <div className="space-y-4 bg-white border p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold">🛠️ Assembly Impact Manual Check</h3>
      <input
        name="changedFeature"
        placeholder="Changed feature (e.g. Rib depth increased)"
        className="w-full border px-2 py-1 text-sm"
        value={form.changedFeature}
        onChange={handleChange}
      />
      <input
        name="matingPartInfo"
        placeholder="Mating part description"
        className="w-full border px-2 py-1 text-sm"
        value={form.matingPartInfo}
        onChange={handleChange}
      />
      <input
        name="fitType"
        placeholder="Fit type (e.g. press fit, slip fit)"
        className="w-full border px-2 py-1 text-sm"
        value={form.fitType}
        onChange={handleChange}
      />
      <input
        name="originalClearance"
        placeholder="Original clearance (e.g. 0.1 mm)"
        className="w-full border px-2 py-1 text-sm"
        value={form.originalClearance}
        onChange={handleChange}
      />
      <textarea
        name="newGeometryContext"
        placeholder="Describe new geometry context"
        className="w-full border px-2 py-1 text-sm"
        rows={3}
        value={form.newGeometryContext}
        onChange={handleChange}
      />
      <button
        onClick={handleCheck}
        className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        🔍 Analyze Assembly Impact
      </button>

      {result && (
        <div className="bg-blue-50 border p-3 rounded-md text-sm">
          <strong>GPT Insight:</strong>
          <pre className="whitespace-pre-wrap mt-1">{result}</pre>
        </div>
      )}
    </div>
  );
};
