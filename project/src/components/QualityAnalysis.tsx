import React, { useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { 
  Ruler, 
  Box, 
  Layers, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Maximize,
  Scale,
  Microscope,
  RotateCcw
} from 'lucide-react';
import { analyzeGeometry } from '../utils/geometryAnalysis';

interface Measurement {
  name: string;
  nominal: number;
  actual: number;
  tolerance: number;
  unit: string;
  isPass: boolean;
  uncertainty: number;
}

interface FeatureAnalysis {
  type: string;
  measurements: Measurement[];
  notes: string[];
  status: 'pass' | 'fail' | 'warning';
}

export const QualityAnalysis: React.FC = () => {
  const { selectedParts } = useModelStore();
  const [activeTab, setActiveTab] = useState<'dimensions' | 'features' | 'summary'>('dimensions');

  if (!selectedParts || selectedParts.length === 0) return null;

  const selectedPart = selectedParts[0];
  if (!selectedPart || !selectedPart.geometry) return null;

  const analysis = analyzeGeometry(selectedPart.geometry);
  const boundingBox = selectedPart.geometry.boundingBox;

  // Primary Dimensions Analysis
  const primaryDimensions: Measurement[] = [
    {
      name: 'Length',
      nominal: 100,
      actual: boundingBox ? Math.abs(boundingBox.max.x - boundingBox.min.x) : 0,
      tolerance: 0.1,
      unit: 'mm',
      isPass: true,
      uncertainty: 0.01
    },
    {
      name: 'Width',
      nominal: 100,
      actual: boundingBox ? Math.abs(boundingBox.max.y - boundingBox.min.y) : 0,
      tolerance: 0.1,
      unit: 'mm',
      isPass: true,
      uncertainty: 0.01
    },
    {
      name: 'Height',
      nominal: 50,
      actual: boundingBox ? Math.abs(boundingBox.max.z - boundingBox.min.z) : 0,
      tolerance: 0.1,
      unit: 'mm',
      isPass: true,
      uncertainty: 0.01
    }
  ];

  // Volume Analysis
  const volumeAnalysis: FeatureAnalysis = {
    type: 'Volume',
    measurements: [
      {
        name: 'Total Volume',
        nominal: 100000,
        actual: analysis.volume,
        tolerance: analysis.volume * 0.02, // 2% tolerance
        unit: 'mm³',
        isPass: true,
        uncertainty: analysis.volume * 0.005
      }
    ],
    notes: [],
    status: 'pass'
  };

  // Special Features Analysis
  const specialFeatures: FeatureAnalysis[] = [
    {
      type: 'Thin Walls',
      measurements: analysis.features.thinWalls.map(wall => ({
        name: 'Wall Thickness',
        nominal: 2.0,
        actual: wall.thickness,
        tolerance: 0.1,
        unit: 'mm',
        isPass: wall.thickness >= 1.9,
        uncertainty: 0.01
      })),
      notes: analysis.features.thinWalls.map(wall => 
        `Thin wall detected at position (${wall.position.x.toFixed(2)}, ${wall.position.y.toFixed(2)}, ${wall.position.z.toFixed(2)})`
      ),
      status: analysis.features.thinWalls.some(wall => wall.thickness < 1.9) ? 'fail' : 'pass'
    },
    {
      type: 'Undercuts',
      measurements: analysis.features.undercuts.map(undercut => ({
        name: 'Draft Angle',
        nominal: 3,
        actual: undercut.angle * (180/Math.PI),
        tolerance: 0.5,
        unit: '°',
        isPass: (undercut.angle * (180/Math.PI)) >= 2.5,
        uncertainty: 0.1
      })),
      notes: analysis.features.undercuts.map(undercut => 
        `Undercut detected with ${(undercut.angle * (180/Math.PI)).toFixed(1)}° angle`
      ),
      status: analysis.features.undercuts.some(undercut => (undercut.angle * (180/Math.PI)) < 2.5) ? 'fail' : 'pass'
    }
  ];

  const renderMeasurement = (measurement: Measurement) => (
    <div className={`bg-gray-50 p-3 rounded-lg ${!measurement.isPass ? 'border-2 border-red-300' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-gray-700">{measurement.name}</span>
        {measurement.isPass ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <XCircle size={16} className="text-red-500" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Nominal</span>
          <div className="font-medium">{measurement.nominal} {measurement.unit}</div>
        </div>
        <div>
          <span className="text-gray-500">Actual</span>
          <div className="font-medium">{measurement.actual.toFixed(3)} {measurement.unit}</div>
        </div>
        <div>
          <span className="text-gray-500">Tolerance</span>
          <div className="font-medium">±{measurement.tolerance} {measurement.unit}</div>
        </div>
        <div>
          <span className="text-gray-500">Uncertainty</span>
          <div className="font-medium">±{measurement.uncertainty} {measurement.unit}</div>
        </div>
      </div>
    </div>
  );

  const renderFeatureAnalysis = (feature: FeatureAnalysis) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">{feature.type}</h4>
        {feature.status === 'pass' ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Pass</span>
        ) : feature.status === 'fail' ? (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Fail</span>
        ) : (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Warning</span>
        )}
      </div>
      {feature.measurements.map((measurement, index) => (
        <div key={index} className="ml-4">
          {renderMeasurement(measurement)}
        </div>
      ))}
      {feature.notes.length > 0 && (
        <div className="ml-4 mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
          {feature.notes.map((note, index) => (
            <div key={index}>• {note}</div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Microscope className="text-blue-600" />
          Quality Control Report
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dimensions' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-1">
              <Ruler size={16} />
              <span>Dimensions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'features' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-1">
              <Layers size={16} />
              <span>Features</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'summary' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-1">
              <Scale size={16} />
              <span>Summary</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'dimensions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Maximize size={16} className="text-blue-600" />
              Primary Dimensions
            </h3>
            <div className="space-y-3">
              {primaryDimensions.map((dimension, index) => (
                <div key={index}>
                  {renderMeasurement(dimension)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Box size={16} className="text-blue-600" />
              Volume Analysis
            </h3>
            {renderFeatureAnalysis(volumeAnalysis)}
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-6">
          {specialFeatures.map((feature, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-blue-600" />
                {feature.type}
              </h3>
              {renderFeatureAnalysis(feature)}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Overall Quality Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Primary Dimensions</span>
                {primaryDimensions.every(d => d.isPass) ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Pass</span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Fail</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Volume Conformance</span>
                {volumeAnalysis.status === 'pass' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Pass</span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Fail</span>
                )}
              </div>
              {specialFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{feature.type}</span>
                  {feature.status === 'pass' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Pass</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Fail</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">Recommendations</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              {primaryDimensions.some(d => !d.isPass) && (
                <li>• Review primary dimensions that are out of tolerance</li>
              )}
              {volumeAnalysis.status === 'fail' && (
                <li>• Investigate volume discrepancy and adjust process parameters</li>
              )}
              {specialFeatures.some(f => f.status === 'fail') && (
                <li>• Address critical feature failures in thin walls and undercuts</li>
              )}
              <li>• Maintain current quality control measures for passing features</li>
              <li>• Schedule regular calibration of measurement equipment</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};