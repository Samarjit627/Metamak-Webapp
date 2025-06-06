// MemoryDashboard.tsx
import React, { useEffect, useState } from "react";
import { summarizePatterns, getPastParts } from "./cadMemoryEngine";

const MemoryDashboard: React.FC = () => {
  const [patterns, setPatterns] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);

  useEffect(() => {
    setPatterns(summarizePatterns());
    setParts(getPastParts());
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧠 CAD Memory Dashboard</h2>

      {patterns && (
        <div className="mb-6 border p-4 rounded bg-white shadow">
          <h3 className="font-semibold text-md mb-2">📊 Summary Insights</h3>
          <p>📁 Total Parts Learned: <b>{patterns.partCount}</b></p>
          <p>🦴 Average Rib Ratio: <b>{patterns.avgRibRatio?.toFixed(2)}</b></p>
          <p>🧱 Wall Thickness Range: <b>{patterns.minWallRange?.min} – {patterns.minWallRange?.max} mm</b></p>
          <p>📐 Common Tolerances: <b>{patterns.commonTolerances.join(", ")} mm</b></p>
        </div>
      )}

      <div className="border p-4 rounded bg-white shadow">
        <h3 className="font-semibold text-md mb-2">📂 Past Parts</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">🆔 Part ID</th>
              <th>Process</th>
              <th>Material</th>
              <th>Rib</th>
              <th>Wall</th>
              <th>Score</th>
              <th>Overrides</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p, idx) => (
              <tr key={idx} className="border-t">
                <td>{p.partId}</td>
                <td>{p.process}</td>
                <td>{p.material}</td>
                <td>{p.ribRatio ?? "–"}</td>
                <td>{p.minWall ?? "–"} mm</td>
                <td>{p.score ?? "–"}</td>
                <td>{(p.overrides || []).join(", ") || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemoryDashboard;
