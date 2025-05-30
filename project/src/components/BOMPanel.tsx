import React, { useState } from 'react';
import { useModelStore } from '../store/modelStore';
import { FileText, Tag, Download, Building2, Factory, Info, X } from 'lucide-react';
import { VendorModal } from './VendorModal';

interface BOMPanelProps {
  onClose: () => void;
}

export const BOMPanel: React.FC<BOMPanelProps> = ({ onClose }) => {
  const { bomItems } = useModelStore();
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Bill of Materials</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrency(curr => curr === 'INR' ? 'USD' : 'INR')}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {bomItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>No parts selected for BOM</p>
            <p className="text-sm mt-2">Select parts to add them to the BOM</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {bomItems.map((item) => (
                <div key={item.partId} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.material}
                    {item.materialGrade && (
                      <span className="text-gray-400 ml-1">({item.materialGrade})</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Qty: {item.quantity} • {item.process}
                  </div>
                  <div className="text-sm font-medium text-blue-600 mt-1">
                    {formatCost(item.estimatedCost * item.quantity)}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setIsVendorModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white transition-colors"
                    >
                      <Factory size={14} />
                      Get Quote
                    </button>
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
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => {
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
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            bomItems.length > 0 
              ? 'bg-gray-900 text-white hover:bg-gray-800' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors`}
        >
          <Download size={16} />
          Export BOM
        </button>
      </div>

      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSubmit={handleVendorSubmit}
      />
    </div>
  );
};