import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, children }) => {
  return (
    <div 
      className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-96 translate-x-0' : 'w-0 -translate-x-full'
      } z-20 overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Analysis Panel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};