// Axis5 Feature: Assembly Impact Viewer UI + Trigger Logic
import React, { useEffect, useState } from "react";
import { checkAssemblyImpact } from "@/gpt_functions/checkAssemblyImpact";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";

interface AssemblyImpactViewerProps {
  partId: string;
  changedFeature: string;
  matingPartInfo: string;
  fitType: string;
  originalClearance: string;
  newGeometryContext: string;
}

export const AssemblyImpactViewer: React.FC<AssemblyImpactViewerProps> = ({
  partId,
  changedFeature,
  matingPartInfo,
  fitType,
  originalClearance,
  newGeometryContext,
}) => {
  const [impact, setImpact] = useState<string>("");
  const { saveAssemblyImpact } = useMemoryEngine();

  useEffect(() => {
    if (changedFeature && matingPartInfo && fitType) {
      checkAssemblyImpact({
        changedFeature,
        matingPartInfo,
        fitType,
        originalClearance,
        newGeometryContext,
      }).then((result) => {
        setImpact(result);
        saveAssemblyImpact(partId, changedFeature, result);
      });
    }
  }, [
    partId,
    changedFeature,
    matingPartInfo,
    fitType,
    originalClearance,
    newGeometryContext,
    saveAssemblyImpact,
  ]);

  if (!impact) return null;

  return (
    <div className="border bg-blue-50 p-3 rounded-md text-sm mt-4">
      <strong>⚙️ Assembly Impact Insight:</strong>
      <pre className="whitespace-pre-wrap mt-1">{impact}</pre>
    </div>
  );
};
