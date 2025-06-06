// Axis5 UI: InlineToleranceReview for Tolerance Insights
import React from "react";
import { ToleranceInsightBox } from "@/components/ToleranceInsightBox";

interface ParsedTolerance {
  toleranceValue: string;
  dimensionType: string;
}

interface InlineToleranceReviewProps {
  partId: string;
  parsedTolerances: ParsedTolerance[];
  material: string;
  process: string;
  surfaceFinish?: string;
}

export const InlineToleranceReview: React.FC<InlineToleranceReviewProps> = ({
  partId,
  parsedTolerances,
  material,
  process,
  surfaceFinish,
}) => {
  return (
    <div className="space-y-4 mt-4">
      {parsedTolerances.map((tol, index) => (
        <ToleranceInsightBox
          key={index}
          partId={partId}
          toleranceValue={tol.toleranceValue}
          dimensionType={tol.dimensionType}
          material={material}
          process={process}
          surfaceFinish={surfaceFinish}
        />
      ))}
    </div>
  );
};
