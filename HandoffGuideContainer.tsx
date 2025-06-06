// Axis5 Feature: Manufacturing Handoff Guide Integration
import React, { useEffect, useState } from "react";
import { generateHandoffGuide } from "@/gpt_functions/generateHandoffGuide";
import { HandoffGuidePanel } from "./HandoffGuidePanel";

interface HandoffGuideContainerProps {
  partId: string;
  process: string;
  material: string;
  quantity: number;
  userIntent: string;
  risks?: string[];
}

export const HandoffGuideContainer: React.FC<HandoffGuideContainerProps> = ({ partId, process, material, quantity, userIntent, risks }) => {
  const [guideText, setGuideText] = useState<string>("");

  useEffect(() => {
    if (process && material && quantity && userIntent) {
      generateHandoffGuide({
        process,
        material,
        quantity,
        userIntent,
        risks,
        partName: partId,
      }).then(setGuideText);
    }
  }, [process, material, quantity, userIntent, risks, partId]);

  if (!guideText) return null;

  return <HandoffGuidePanel partId={partId} guideText={guideText} />;
};
