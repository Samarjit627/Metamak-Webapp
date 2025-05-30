import React from 'react';
import { ListChecks } from 'lucide-react';

interface VerticalBOMButtonProps {
  onClick: () => void;
}

export const VerticalBOMButton: React.FC<VerticalBOMButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-20">
      <button
        onClick={onClick}
        className="flex items-center gap-4 bg-white shadow-lg hover:bg-gray-50 transition-colors py-4 px-3 rounded-r-lg border border-l-0 border-gray-200"
      >
        <ListChecks size={20} className="text-gray-700" />
        <div className="relative w-20 h-5">
          <span className="absolute text-gray-700 font-medium text-sm whitespace-nowrap transform -rotate-90 origin-left">
            BOM
          </span>
        </div>
      </button>
    </div>
  );
};