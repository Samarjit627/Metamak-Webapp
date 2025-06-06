// Axis5 Phase 5 UI: ToleranceInsightBox
import React, { useEffect, useState } from "react";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";
import { checkToleranceFeasibility } from "@/gpt_functions/checkToleranceFeasibility";

interface ToleranceInsightBoxProps {
  partId: string;
  toleranceValue: string;
  dimensionType: string;
  material: string;
  process: string;
  surfaceFinish?: string;
}

export const ToleranceInsightBox: React.FC<ToleranceInsightBoxProps> = ({
  partId,
  toleranceValue,
  dimensionType,
  material,
  process,
  surfaceFinish,
}) => {
  const [insight, setInsight] = useState<string>("");
  const { saveToleranceInsight } = useMemoryEngine();

  useEffect(() => {
    if (toleranceValue && dimensionType) {
      checkToleranceFeasibility({
        toleranceValue,
        dimensionType,
        material,
        process,
        surfaceFinish,
      }).then((result) => {
        setInsight(result);
        saveToleranceInsight(partId, dimensionType, result);
      });
    }
  }, [
    toleranceValue,
    dimensionType,
    material,
    process,
    surfaceFinish,
    partId,
    saveToleranceInsight,
  ]);

  if (!insight) return null;

  return (
    <div className="border p-3 rounded-md bg-yellow-50 text-xs mt-2">
      <strong>🔍 Tolerance Insight:</strong>
      <pre className="whitespace-pre-wrap mt-1">{insight}</pre>
    </div>
  );
};
