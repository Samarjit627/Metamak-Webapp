import React from 'react';
import { useModelStore } from '../store/modelStore';
import { X, Box, Ruler, Layers, Info, BarChart3, Factory, Tag } from 'lucide-react';

interface PartAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  partId: string | null;
}

export const PartAnalysisModal: React.FC<PartAnalysisModalProps> = ({
  isOpen,
  onClose,
  partId
}) => {
  const { bomItems } = useModelStore();
  
  if (!isOpen || !partId) return null;
  
  const part = bomItems.find(item => item.partId === partId);
  if (!part) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Manufacturing Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Part Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{part.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Material</span>
                  <div className="font-medium mt-1">
                    {part.material}
                    {part.materialGrade && (
                      <span className="inline-flex items-center ml-1 text-sm text-gray-500">
                        <Tag size={12} className="mr-0.5" />
                        {part.materialGrade}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Manufacturing Process</span>
                  <div className="font-medium mt-1">{part.process}</div>
                </div>
              </div>
            </div>

            {/* Manufacturing Process Analysis */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Factory size={16} className="text-blue-600" />
                Process Details
              </h4>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Process Suitability</span>
                    <span className="text-sm px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      85% Match
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Recommended for this part's geometry and requirements
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-600">Lead Time</span>
                    <div className="font-medium mt-1">2-3 weeks</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-600">Minimum Quantity</span>
                    <div className="font-medium mt-1">50 units</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Surface Requirements */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Layers size={16} className="text-blue-600" />
                Surface Requirements
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Surface Finish</span>
                  <div className="font-medium mt-1">Ra 1.6 μm</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Tolerance</span>
                  <div className="font-medium mt-1">±0.1 mm</div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Info size={16} className="text-blue-600" />
                Cost Analysis
              </h4>
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Material Cost</span>
                      <span className="font-medium">₹450/unit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Processing Cost</span>
                      <span className="font-medium">₹850/unit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Setup Cost (Amortized)</span>
                      <span className="font-medium">₹200/unit</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-800">Total Cost per Unit</span>
                        <span className="text-blue-600">₹1,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturing Notes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Ruler size={16} className="text-blue-600" />
                Manufacturing Notes
              </h4>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• All unspecified radii: 0.5 mm max</li>
                  <li>• Break all sharp edges: 0.2 mm × 45°</li>
                  <li>• Surface finish: Ra 1.6 μm unless noted</li>
                  <li>• General tolerance: ±0.1 mm</li>
                  <li>• Critical features must be inspected before processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};