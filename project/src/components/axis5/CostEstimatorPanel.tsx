// components/CostEstimatorPanel.tsx
import React, { useEffect, useState } from "react";
import { CostCurveChart } from "@/components/CostCurveChart";
import { generateCostCurve } from "@/functions/generateCostCurve";
import { predictLeadTime } from "@/functions/leadTimePredictor";

export const CostEstimatorPanel = ({
  process,
  material,
  quantity,
  estimatedCostPerUnit,
}) => {
  const [curve, setCurve] = useState([]);
  const [leadTime, setLeadTime] = useState("");

  useEffect(() => {
    const curveData = generateCostCurve({ baseCost: estimatedCostPerUnit });
    setCurve(curveData);
    predictLeadTime({ process, material, quantity, location: "India" }).then(setLeadTime);
  }, [process, material, quantity, estimatedCostPerUnit]);

  return (
    <div className="space-y-4 p-4 border rounded bg-white">
      <h3 className="font-semibold text-sm">💰 Cost Estimation</h3>
      <p>Estimated cost at {quantity} units: ₹{estimatedCostPerUnit?.toFixed(2)}</p>

      <CostCurveChart data={curve} />

      <div className="text-sm bg-yellow-50 p-3 rounded">
        <strong>⏳ Lead Time Estimate:</strong>
        <pre className="whitespace-pre-wrap mt-1">{leadTime}</pre>
      </div>
    </div>
  );
};
