import React from 'react';
import { Box, Ruler, Layers, AlertTriangle, Gauge } from 'lucide-react';

interface PartAnalysisPanelProps {
  analyses: any[];
}

export const PartAnalysisPanel: React.FC<PartAnalysisPanelProps> = ({ analyses }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>Select parts to analyze manufacturing features</p>
      </div>
    );
  }

  const analysis = analyses[0];
  if (!analysis) return null;

  // Calculate manufacturability score
  const manufacturabilityScore = Math.round((analysis.dualCostEstimate?.manufacturabilityScore || 0.7) * 100);

  // Get dimensions from analysis
  const dimensions = analysis.boundingBox || { width: 0, height: 0, depth: 0 };

  // Get features from analysis
  const features = analysis.features || {};

  // Maximum number of items to display per feature category
  const MAX_DISPLAY_ITEMS = 3;

  return (
    <div className="space-y-6">
      {/* Manufacturability Score */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-blue-600" />
          Manufacturability Score
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Score</span>
            <div className={`text-lg font-bold ${
              manufacturabilityScore >= 80 ? 'text-green-600' :
              manufacturabilityScore >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {manufacturabilityScore}%
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                manufacturabilityScore >= 80 ? 'bg-green-500' :
                manufacturabilityScore >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${manufacturabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Geometry Analysis */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Box size={16} className="text-blue-600" />
          Geometry Analysis
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 text-xs">Volume</span>
            <div className="font-medium">{(analysis.volume || 0).toFixed(2)} cm³</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 text-xs">Surface Area</span>
            <div className="font-medium">{(analysis.surfaceArea || 0).toFixed(2)} cm²</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 text-xs">Dimensions</span>
            <div className="font-medium">
              {dimensions.width.toFixed(1)} × {dimensions.height.toFixed(1)} × {dimensions.depth.toFixed(1)} cm
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 text-xs">Complexity</span>
            <div className="font-medium">{(analysis.complexity || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Manufacturing Features */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Ruler size={16} className="text-blue-600" />
          Manufacturing Features
        </h3>
        <div className="space-y-3">
          {/* Holes */}
          {features.holes?.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Box size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Holes</span>
              </div>
              <div className="space-y-2">
                {features.holes.slice(0, MAX_DISPLAY_ITEMS).map((hole: any, index: number) => (
                  <div key={index} className="text-sm text-blue-700">
                    • Diameter: {hole.diameter.toFixed(2)}mm
                  </div>
                ))}
                {features.holes.length > MAX_DISPLAY_ITEMS && (
                  <div className="text-sm text-blue-700">
                    • ... and {features.holes.length - MAX_DISPLAY_ITEMS} more holes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thin Walls */}
          {features.thinWalls?.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="font-medium text-yellow-800">Thin Walls</span>
              </div>
              <div className="space-y-2">
                {features.thinWalls.slice(0, MAX_DISPLAY_ITEMS).map((wall: any, index: number) => (
                  <div key={index} className="text-sm text-yellow-700">
                    • Thickness: {wall.thickness.toFixed(2)}mm
                  </div>
                ))}
                {features.thinWalls.length > MAX_DISPLAY_ITEMS && (
                  <div className="text-sm text-yellow-700">
                    • ... and {features.thinWalls.length - MAX_DISPLAY_ITEMS} more thin areas
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ribs */}
          {features.ribs?.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Box size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Ribs</span>
              </div>
              <div className="space-y-2">
                {features.ribs.slice(0, MAX_DISPLAY_ITEMS).map((rib: any, index: number) => (
                  <div key={index} className="text-sm text-blue-700">
                    • Height: {rib.height.toFixed(2)}mm, Thickness: {rib.thickness.toFixed(2)}mm
                  </div>
                ))}
                {features.ribs.length > MAX_DISPLAY_ITEMS && (
                  <div className="text-sm text-blue-700">
                    • ... and {features.ribs.length - MAX_DISPLAY_ITEMS} more ribs
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bosses */}
          {features.bosses?.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Box size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Bosses</span>
              </div>
              <div className="space-y-2">
                {features.bosses.slice(0, MAX_DISPLAY_ITEMS).map((boss: any, index: number) => (
                  <div key={index} className="text-sm text-blue-700">
                    • Diameter: {boss.diameter.toFixed(2)}mm, Height: {boss.height.toFixed(2)}mm
                  </div>
                ))}
                {features.bosses.length > MAX_DISPLAY_ITEMS && (
                  <div className="text-sm text-blue-700">
                    • ... and {features.bosses.length - MAX_DISPLAY_ITEMS} more bosses
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Undercuts */}
          {features.undercuts && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="font-medium text-yellow-800">Undercuts Detected</span>
              </div>
              <div className="text-sm text-yellow-700">
                • Undercuts may require side actions or design changes
              </div>
            </div>
          )}

          {/* Sharp Corners */}
          {features.sharpCorners?.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="font-medium text-yellow-800">Sharp Corners</span>
              </div>
              <div className="space-y-2">
                {features.sharpCorners.slice(0, MAX_DISPLAY_ITEMS).map((corner: any, index: number) => (
                  <div key={index} className="text-sm text-yellow-700">
                    • Angle: {corner.angle.toFixed(1)}°
                  </div>
                ))}
                {features.sharpCorners.length > MAX_DISPLAY_ITEMS && (
                  <div className="text-sm text-yellow-700">
                    • ... and {features.sharpCorners.length - MAX_DISPLAY_ITEMS} more sharp corners
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Features */}
          {!features.holes?.length && 
           !features.thinWalls?.length && 
           !features.ribs?.length && 
           !features.bosses?.length && 
           !features.undercuts && 
           !features.sharpCorners?.length && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-green-600" />
                <span className="font-medium text-green-800">No Critical Manufacturing Features Detected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quality Requirements */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Layers size={16} className="text-blue-600" />
          Quality Requirements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 text-xs">Surface Finish</span>
            <div className="font-medium">Ra 1.6 μm</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600 text-xs">Tolerance Class</span>
            <div className="font-medium">{analysis.tolerances || '±0.1mm'}</div>
          </div>
        </div>
      </div>

      {/* Manufacturing Recommendations */}
      {analysis.dualCostEstimate?.recommendations && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-blue-600" />
            Recommendations
          </h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <ul className="space-y-2 text-sm text-blue-800">
              {analysis.dualCostEstimate.recommendations.map((rec: string, index: number) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};