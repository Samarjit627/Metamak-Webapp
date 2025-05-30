import React from 'react';
import { CostEstimatorOutput } from '../utils/dualModeCostEstimatorV3';
import { DollarSign, PenTool as Tool, Settings, MapPin, Zap, Info, ArrowRight } from 'lucide-react';

interface Props {
  estimate: CostEstimatorOutput;
  quantity: number;
  material: string;
  process: string;
  currency?: 'INR' | 'USD';
}

export const CostAnalysisPanel: React.FC<Props> = ({ 
  estimate, 
  quantity, 
  material, 
  process,
  currency = 'INR'
}) => {
  const {
    basicCost,
    toolingCost = 0,
    setupCost = 0,
    totalCost,
    mode,
    recommendations
  } = estimate;

  const formatCurrency = (amount: number): string => {
    if (currency === 'USD') {
      const usdAmount = amount / 83; // Approximate INR to USD conversion
      return `$${usdAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const getBgColor = (mode: string): string => {
    switch (mode) {
      case 'Prototyping':
        return 'bg-blue-50';
      case 'Bridge':
        return 'bg-orange-50';
      case 'Production':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getTextColor = (mode: string): string => {
    switch (mode) {
      case 'Prototyping':
        return 'text-blue-800';
      case 'Bridge':
        return 'text-orange-800';
      case 'Production':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Production Mode Banner */}
      <div className={`${getBgColor(mode)} p-4 rounded-lg border border-gray-200 shadow-sm`}>
        <div className="flex items-center gap-2 mb-2">
          <Settings size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Production Mode: {mode}</h3>
        </div>
        <div className={`${getTextColor(mode)} space-y-2`}>
          <p className="text-sm">
            {mode === 'Prototyping' 
              ? 'Optimized for rapid iteration and design validation'
              : mode === 'Bridge'
              ? 'Balanced for medium-volume production with flexible tooling'
              : 'Optimized for high-volume manufacturing efficiency'}
          </p>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Cost Analysis</h3>
          </div>
          <div className="text-sm text-gray-500">
            {quantity.toLocaleString()} units
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-600">Basic Cost (per unit)</span>
            <div className="text-lg font-semibold">{formatCurrency(basicCost)}</div>
            <span className="text-xs text-gray-500">Material + Processing</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-600">Total Project Cost</span>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(totalCost * quantity)}
            </div>
            <span className="text-xs text-gray-500">All inclusive</span>
          </div>
        </div>
      </div>

      {/* Tooling & Setup */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Tool size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Tooling & Setup</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-600">Tooling Investment</span>
            <div className="font-semibold">{formatCurrency(toolingCost)}</div>
            <span className="text-xs text-gray-500">One-time cost</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-600">Setup Cost</span>
            <div className="font-semibold">{formatCurrency(setupCost)}</div>
            <span className="text-xs text-gray-500">Per production run</span>
          </div>
        </div>
      </div>

      {/* Process Advantages */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Process Advantages</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Material: {material}</div>
              <div className="text-sm text-blue-700">Optimal for {process} with current quantity</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-800">Lead Time</div>
              <div className="text-sm text-gray-600">
                {mode === 'Prototyping' ? '1-2 weeks' : mode === 'Bridge' ? '2-3 weeks' : '3-4 weeks'}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-800">Design Flexibility</div>
              <div className="text-sm text-gray-600">
                {mode === 'Prototyping' ? 'High' : mode === 'Bridge' ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Info size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg">
              <ArrowRight size={16} className="mt-0.5 text-gray-600" />
              <span className="text-sm text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};