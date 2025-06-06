// ScoreBadge.tsx

import React from "react";

export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color = "bg-green-500";
  if (score < 85 && score >= 60) color = "bg-yellow-400";
  if (score < 60) color = "bg-red-500";

  return (
    <div className={`inline-block ${color} text-white px-3 py-1 rounded-full text-sm`}>
      🏁 Manufacturability Score: {score}/100
    </div>
  );
};
