import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIRecommendationsButtonProps {
  onClick: () => void;
}

export const AIRecommendationsButton: React.FC<AIRecommendationsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
    >
      <Sparkles size={18} className="text-blue-600" />
      <span className="text-sm font-medium text-gray-700">AI Recommendations</span>
    </button>
  );
};