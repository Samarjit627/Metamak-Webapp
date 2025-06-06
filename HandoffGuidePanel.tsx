// Axis5 Feature: Manufacturing Handoff Guide
// UI Component: HandoffGuidePanel.tsx

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";
import { usePDF } from "react-to-pdf";

interface HandoffGuidePanelProps {
  partId: string;
  guideText: string;
}

export const HandoffGuidePanel: React.FC<HandoffGuidePanelProps> = ({ partId, guideText }) => {
  const { saveHandoffGuide } = useMemoryEngine();
  const { toPDF, targetRef } = usePDF({ filename: `handoff_guide_${partId}.pdf` });

  useEffect(() => {
    if (guideText) {
      saveHandoffGuide(partId, guideText);
    }
  }, [guideText, partId, saveHandoffGuide]);

  return (
    <div className="animate-fade-in p-4">
      <Card>
        <CardContent ref={targetRef} className="whitespace-pre-wrap text-sm">
          {guideText}
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => toPDF()} variant="outline">
          📄 Export as PDF
        </Button>
      </div>
    </div>
  );
};
