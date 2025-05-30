import React, { useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { VendorModal } from './VendorModal';
import { getMaterialLabel } from '../data/materials';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Building2, 
  FileText,
  ShoppingCart,
  Tag,
  BarChart3,
  Factory,
  Box,
  Ruler,
  Layers,
  Info,
  ChevronDown
} from 'lucide-react';

export const BOMSidebar: React.FC = () => {
  const { bomItems } = useModelStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const totalCost = bomItems.reduce((sum, item) => {
    const itemTotalCost = item.estimatedCost * item.quantity;
    return isFinite(itemTotalCost) ? sum + itemTotalCost : sum;
  }, 0);

  const formatCost = (cost: number): string => {
    if (!isFinite(cost)) return 'N/A';
    const value = currency === 'INR' ? cost : cost / 83;
    return currency === 'INR' 
      ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
      : `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const handleVendorSubmit = (selectedVendors: string[]) => {
    console.log('Selected vendors:', selectedVendors);
    setIsVendorModalOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white shadow-md rounded-r-lg p-2 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-0 h-full z-20 flex">
      <div className="bg-white shadow-lg border-r border-gray-200 h-full w-80 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Bill of Materials</h2>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {bomItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
              <ShoppingCart size={40} className="mb-2 opacity-50" />
              <p>No parts selected for BOM</p>
              <p className="text-sm mt-2">Select parts from the 3D view to analyze and add to BOM</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Parts List</h3>
                <button
                  onClick={() => setCurrency(curr => curr === 'INR' ? 'USD' : 'INR')}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {currency === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              </div>

              <div className="space-y-3">
                {bomItems.map((item) => (
                  <div key={item.partId} className="border rounded-lg overflow-hidden bg-white">
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.material}
                            {item.materialGrade && (
                              <span className="inline-flex items-center ml-1">
                                <Tag size={10} className="mr-0.5" />
                                {item.materialGrade}
                              </span>
                            )}
                            {' / '}{item.process}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCost(item.estimatedCost * item.quantity)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setExpandedPartId(expandedPartId === item.partId ? null : item.partId)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors"
                        >
                          <BarChart3 size={14} />
                          Analysis
                          <ChevronDown
                            size={14}
                            className={`transform transition-transform ${
                              expandedPartId === item.partId ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => setIsVendorModalOpen(true)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white transition-colors"
                        >
                          <Factory size={14} />
                          Get Quote
                        </button>
                      </div>

                      {/* Part Analysis Panel */}
                      {expandedPartId === item.partId && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-4">
                          {/* Manufacturing Process Analysis */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                              <Factory size={14} className="text-blue-600" />
                              Process Details
                            </h4>
                            <div className="space-y-2">
                              <div className="bg-blue-50 p-2 rounded">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-900">Process Suitability</span>
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                    85% Match
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-xs text-gray-600">Lead Time</span>
                                  <div className="text-sm font-medium">2-3 weeks</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-xs text-gray-600">Min. Quantity</span>
                                  <div className="text-sm font-medium">50 units</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Surface Requirements */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                              <Layers size={14} className="text-blue-600" />
                              Surface Requirements
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-600">Surface Finish</span>
                                <div className="text-sm font-medium">Ra 1.6 μm</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-600">Tolerance</span>
                                <div className="text-sm font-medium">±0.1 mm</div>
                              </div>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                              <Info size={14} className="text-blue-600" />
                              Cost Breakdown
                            </h4>
                            <div className="bg-gray-50 p-2 rounded space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Material</span>
                                <span className="font-medium">{formatCost(450)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Processing</span>
                                <span className="font-medium">{formatCost(850)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Setup (Amortized)</span>
                                <span className="font-medium">{formatCost(200)}</span>
                              </div>
                              <div className="pt-1 mt-1 border-t border-gray-200">
                                <div className="flex justify-between text-sm font-medium">
                                  <span>Total per Unit</span>
                                  <span className="text-blue-600">{formatCost(item.estimatedCost)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Manufacturing Notes */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                              <Ruler size={14} className="text-blue-600" />
                              Manufacturing Notes
                            </h4>
                            <div className="bg-yellow-50 p-2 rounded">
                              <ul className="space-y-1 text-xs text-yellow-800">
                                <li>• All unspecified radii: 0.5 mm max</li>
                                <li>• Break sharp edges: 0.2 mm × 45°</li>
                                <li>• Surface finish: Ra 1.6 μm unless noted</li>
                                <li>• General tolerance: ±0.1 mm</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="text-blue-600">{formatCost(totalCost)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                <p>* Prices are estimates based on selected manufacturing processes</p>
                <p>* Location: {bomItems[0]?.location || 'Not specified'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => {
              if (bomItems.length === 0) return;
              
              const csvContent = [
                ['Part Name', 'Quantity', 'Material', 'Material Grade', 'Process', `Cost Per Unit (${currency})`, 'Notes'].join(','),
                ...bomItems.map(item => [
                  item.name,
                  item.quantity,
                  item.material,
                  item.materialGrade || 'Standard',
                  item.process,
                  formatCost(item.estimatedCost),
                  item.notes
                ].join(','))
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'manufacturing_bom.csv';
              link.click();
            }}
            disabled={bomItems.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md ${
              bomItems.length > 0 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            <Download size={16} />
            Export BOM
          </button>
        </div>
      </div>

      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSubmit={handleVendorSubmit}
      />
    </div>
  );
};