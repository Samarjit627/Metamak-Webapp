import React from 'react';
import { PlanOutput } from '../agents/autoManufacturingPlanAgent';
import { Factory, PenTool as Tool, AlertTriangle, DollarSign, Sparkles } from 'lucide-react';

interface ManufacturingPlanDisplayProps {
  plan: PlanOutput;
  onRegeneratePlan: () => void;
  onAskQuestion: () => void;
  currency: 'INR' | 'USD';
}

export const ManufacturingPlanDisplay: React.FC<ManufacturingPlanDisplayProps> = ({
  plan,
  onRegeneratePlan,
  onAskQuestion,
  currency
}) => {
  const formatCost = (cost: number): string => {
    if (!isFinite(cost)) return 'N/A';
    const value = currency === 'INR' ? cost : cost / 83;
    return currency === 'INR' 
      ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
      : `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Process Recommendation */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Factory className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Manufacturing Plan</h2>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800 whitespace-pre-line">{plan.decisionNarrative}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Process */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Recommended Process</h3>
            <p className="text-green-700">{plan.recommendedProcess}</p>
          </div>

          {/* Alternative Processes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Alternative Processes</h3>
            <ul className="space-y-1">
              {plan.alternativeProcesses.map((process, index) => (
                <li key={index} className="text-gray-700">• {process}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Costs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Cost Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Tooling Investment</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCost(plan.toolingCost)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Unit Cost</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCost(plan.unitCost)}</p>
          </div>
        </div>
      </div>

      {/* DFM Risks */}
      {plan.dfmRisks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">DFM Considerations</h2>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {plan.dfmRisks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-800">
                  <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onRegeneratePlan}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Sparkles size={16} />
          Regenerate Plan
        </button>

        <button
          onClick={onAskQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Tool size={16} />
          Ask About This Plan
        </button>
      </div>
    </div>
  );
};