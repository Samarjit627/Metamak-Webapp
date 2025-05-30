import React, { useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { 
  Ruler, 
  Box, 
  Layers, 
  AlertTriangle,
  CheckCircle,
  Gauge,
  Zap,
  Settings,
  ArrowRight,
  Brain,
  LineChart,
  Leaf,
  Factory,
  Info,
  Sparkles,
  BarChart3,
  DollarSign
} from 'lucide-react';

export const AIRecommendationsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { cadAnalysis } = useModelStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'processes' | 'analysis'>('processes');

  if (!cadAnalysis) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold">AI Manufacturing Analysis</h2>
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">
          <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
          <p>Select a part to analyze</p>
          <p className="text-sm mt-2">AI will provide comprehensive manufacturing insights</p>
        </div>
      </div>
    );
  }

  const manufacturabilityScore = Math.round((cadAnalysis.manufacturabilityScore || 0) * 100);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'costs', label: 'Cost Analysis', icon: DollarSign },
    { id: 'processes', label: 'Manufacturing', icon: Factory },
    { id: 'analysis', label: 'Part Analysis', icon: Box }
  ];

  return (
    <div className="p-4 space-y-6">
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

      {/* Features Analysis */}
      {cadAnalysis.features && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Box size={16} className="text-blue-600" />
            Feature Analysis
          </h3>
          <div className="space-y-3">
            {/* Thin Walls */}
            {cadAnalysis.features.thinWalls && cadAnalysis.features.thinWalls.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="font-medium text-yellow-800">Thin Walls Detected</span>
                </div>
                <div className="space-y-2">
                  {cadAnalysis.features.thinWalls.slice(0, 3).map((wall, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      • Wall thickness: {wall.thickness?.toFixed(2) || 'N/A'} mm
                    </div>
                  ))}
                  {cadAnalysis.features.thinWalls.length > 3 && (
                    <div className="text-sm text-yellow-700">
                      • ... and {cadAnalysis.features.thinWalls.length - 3} more thin areas
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Undercuts */}
            {cadAnalysis.features.undercuts && (
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
            {cadAnalysis.features.sharpCorners && cadAnalysis.features.sharpCorners.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="font-medium text-yellow-800">Sharp Corners Detected</span>
                </div>
                <div className="space-y-2">
                  {cadAnalysis.features.sharpCorners.slice(0, 3).map((corner, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      • Angle: {corner.angle?.toFixed(1) || 'N/A'}°
                    </div>
                  ))}
                  {cadAnalysis.features.sharpCorners.length > 3 && (
                    <div className="text-sm text-yellow-700">
                      • ... and {cadAnalysis.features.sharpCorners.length - 3} more sharp corners
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {cadAnalysis.recommendations && cadAnalysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Zap size={16} className="text-blue-600" />
            AI Recommendations
          </h3>
          <div className="space-y-2">
            {cadAnalysis.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2 text-sm text-blue-800">
                  <ArrowRight size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsPanel;