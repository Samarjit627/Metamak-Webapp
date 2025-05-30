import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useModelStore } from '../store/modelStore';

export const UndercutAnalysis = () => {
  const { viewerState } = useModelStore();

  if (!viewerState.isSectioningActive || viewerState.undercutWarnings.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Undercut Analysis Warnings</h3>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            {viewerState.undercutWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-yellow-600">
            Consider modifying the design to eliminate undercuts or plan for appropriate tooling solutions.
          </p>
        </div>
      </div>
    </div>
  );
};