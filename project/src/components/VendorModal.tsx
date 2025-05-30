import React from 'react';
import { vendors } from '../data/vendors';
import { Star } from 'lucide-react';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedVendors: string[]) => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedVendors, setSelectedVendors] = React.useState<string[]>([]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Select Manufacturers</h2>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 gap-4">
            {vendors.map((vendor) => (
              <div 
                key={vendor.id}
                className={`border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer ${
                  selectedVendors.includes(vendor.id) ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  setSelectedVendors(prev => 
                    prev.includes(vendor.id)
                      ? prev.filter(id => id !== vendor.id)
                      : [...prev, vendor.id]
                  );
                }}
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={vendor.image} 
                    alt={vendor.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">{vendor.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{vendor.rating}</span>
                        <span className="text-sm text-gray-500">({vendor.reviews})</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{vendor.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Location:</span>
                        <span className="font-medium">{vendor.location.city}, {vendor.location.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Lead Time:</span>
                        <span className="font-medium">{vendor.leadTime}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {vendor.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(selectedVendors);
              setSelectedVendors([]);
            }}
            disabled={selectedVendors.length === 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedVendors.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send RFQ to {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};