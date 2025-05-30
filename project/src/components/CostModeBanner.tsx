import React from 'react';
import { AlertTriangle, Info, Zap } from 'lucide-react';

interface Props {
  quantity: number;
  material: string;
  process: string;
}

export const CostModeBanner = ({ quantity, material, process }: Props) => {
  let mode = '';
  let icon = null;
  let bgColor = '';
  let message = '';
  let suggestions = '';

  if (quantity <= 99) {
    mode = 'Prototyping Mode';
    icon = <Zap className="text-blue-600" size={20} />;
    bgColor = 'bg-blue-50';
    message = 'Tooling and setup costs are not included in per-unit cost.';
    suggestions = 'Processes like CNC, SLA, or FDM are recommended.';
  } else if (quantity <= 999) {
    mode = 'Bridge Production Mode';
    icon = <Info className="text-orange-600" size={20} />;
    bgColor = 'bg-orange-50';
    message = 'Tooling and setup costs are shown separately.';
    suggestions = 'Soft molds, vacuum casting, or RIM are cost-effective.';
  } else {
    mode = 'Mass Production Mode';
    icon = <AlertTriangle className="text-green-600" size={20} />;
    bgColor = 'bg-green-50';
    message = 'Tooling and setup costs are shown separately.';
    suggestions = 'Injection molding or die casting is ideal at this scale.';
  }

  return (
    <div className={`${bgColor} p-4 rounded-lg mt-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold text-gray-900">{mode}</span>
      </div>
      <div className="space-y-1 text-sm text-gray-700">
        <p>• Cost estimate is for <span className="font-medium">{quantity}</span> units using <span className="font-medium">{material}</span> and <span className="font-medium">{process}</span>.</p>
        <p>• {message}</p>
        <p>• {suggestions}</p>
      </div>
    </div>
  );
};