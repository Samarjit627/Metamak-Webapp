import React from 'react';
import { MessageCircle, Clock, DollarSign, ThumbsUp } from 'lucide-react';
import { useChatMetricsStore } from '../store/chatMetricsStore';

interface ChatMetricsDisplayProps {
  isDarkMode: boolean;
}

export const ChatMetricsDisplay: React.FC<ChatMetricsDisplayProps> = ({ isDarkMode }) => {
  const metrics = useChatMetricsStore();

  return (
    <div className={`px-4 py-2 border-t ${
      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <MessageCircle size={14} />
          <span className="text-xs">
            {metrics.userMessages} user • {metrics.assistantMessages} assistant
          </span>
        </div>

        <div className={`flex items-center gap-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <Clock size={14} />
          <span className="text-xs">
            {metrics.averageResponseTime.toFixed(0)}ms
          </span>
        </div>

        <div className={`flex items-center gap-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <DollarSign size={14} />
          <span className="text-xs">
            ${metrics.totalCost.toFixed(4)}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <ThumbsUp size={14} />
          <span className="text-xs">
            {metrics.helpfulFeedback} helpful • {metrics.unhelpfulFeedback} unhelpful
          </span>
        </div>
      </div>
    </div>
  );
};