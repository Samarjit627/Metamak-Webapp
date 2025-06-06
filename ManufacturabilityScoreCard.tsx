// ManufacturabilityScoreCard.tsx
import React, { useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";
import { calculateManufacturabilityScore } from "@/functions/calculateManufacturabilityScore";

interface ManufacturabilityScoreCardProps {
  partId: string;
  dfmPassRate: number;
  toleranceIssues: number;
  assemblyIssueCount: number;
  processMismatch: boolean;
  costToolingRisk: boolean;
  designIntentProvided: boolean;
}

export const ManufacturabilityScoreCard: React.FC<ManufacturabilityScoreCardProps> = ({
  partId,
  dfmPassRate,
  toleranceIssues,
  assemblyIssueCount,
  processMismatch,
  costToolingRisk,
  designIntentProvided,
}) => {
  const [score, setScore] = useState<number>(0);
  const [summary, setSummary] = useState<string>("");
  const { toPDF, targetRef } = usePDF({ filename: `manufacturability_score_${partId}.pdf` });

  useEffect(() => {
    const { score, summary } = calculateManufacturabilityScore({
      dfmPassRate,
      toleranceIssues,
      assemblyIssueCount,
      processMismatch,
      costToolingRisk,
      designIntentProvided,
    });
    setScore(score);
    setSummary(summary);
  }, [
    dfmPassRate,
    toleranceIssues,
    assemblyIssueCount,
    processMismatch,
    costToolingRisk,
    designIntentProvided,
  ]);

  const badgeColor =
    score >= 85 ? "bg-green-500" : score >= 65 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div ref={targetRef}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-5 h-5 rounded-full ${badgeColor}`} />
          <h3 className="text-sm font-bold">Manufacturability Score: {score}/100</h3>
        </div>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{summary}</pre>
      </div>
      <button
        onClick={() => toPDF()}
        className="mt-3 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
      >
        📄 Export Score Report
      </button>
    </div>
  );
};
