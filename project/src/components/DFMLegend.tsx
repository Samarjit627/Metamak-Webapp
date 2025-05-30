import React from 'react';

interface DFMLegendProps {
  onHover?: (issueType: string | null) => void;
  activeType?: string | null;
  detectedTypes: string[];
  closeFeatures: "Features placed too close together for reliable manufacturing.",
  internalText: "Text or details recessed into the part that may be difficult to produce.",
  ejection: "Areas that may be difficult to eject from the mold."
};

// Color mapping for different DFM issues
const dfmColors: Record<string, string> = {
  thinWalls:   "#fb8c00",
  undercuts:   "#e53935",
  sharpCorners:"#1976d2",
  lowDraft:    "#7b1fa2",
  smallHoles:  "#00897b",
  ribs:        "#fdd835",
  bosses:      "#8d6e63",
  wallTransitions:"#546e7a",
  sinkWarpage: "#d81b60",
  closeFeatures:"#43a047",
  internalText:"#5d4037",
  ejection:    "#f4511e"
};

export const DFMLegend: React.FC<DFMLegendProps> = ({ onHover, activeType, detectedTypes }) => {
  const handleMouseEnter = (type: string) => onHover?.(type);
  const handleMouseLeave = () => onHover?.(null);

  // Only show legend items for detectedTypes
  if (!detectedTypes || detectedTypes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm w-72 shadow-lg z-50">
        <strong className="block text-base mb-2">DFM Risk Legend</strong>
        <div className="text-gray-500 text-sm">No DFM risks detected in this part.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm w-72 shadow-lg z-50">
      <strong className="block text-base mb-2">DFM Risk Legend</strong>
      <p className="text-xs text-gray-700 mb-2">
        Hover to highlight; click to lock an issue type.
      </p>
      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
        {detectedTypes.map(type => (
          <div
            key={type}
            className={`flex items-start gap-2 p-1 rounded-md cursor-pointer transition-colors ${activeType === type ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            onMouseEnter={() => handleMouseEnter(type)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onHover?.(type)}
          >
            <span className="text-lg flex-shrink-0" style={{ color: dfmColors[type] }}>●</span>
            <div>
              <div className="font-medium capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</div>
              <p className="text-xs text-gray-600 mt-0.5">{dfmDescriptions[type]}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2 text-center">
        Click “Show All” in the preview to reset.
      </div>
    </div>
  );
};