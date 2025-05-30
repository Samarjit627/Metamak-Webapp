import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useChatMetricsStore } from '../store/chatMetricsStore';

interface MessageFeedbackProps {
  messageIndex: number;
  isDarkMode: boolean;
}

export const MessageFeedback: React.FC<MessageFeedbackProps> = ({ messageIndex, isDarkMode }) => {
  const addFeedback = useChatMetricsStore(state => state.addFeedback);
  const [feedback, setFeedback] = React.useState<'helpful' | 'unhelpful' | null>(null);

  const handleFeedback = (isHelpful: boolean) => {
    if (!feedback) {
      setFeedback(isHelpful ? 'helpful' : 'unhelpful');
      addFeedback(messageIndex, isHelpful);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => handleFeedback(true)}
        className={`p-1 rounded-full transition-colors ${
          feedback === 'helpful'
            ? 'text-green-600 bg-green-100'
            : isDarkMode
            ? 'hover:bg-gray-800 text-gray-400'
            : 'hover:bg-gray-100 text-gray-500'
        } ${feedback === 'unhelpful' ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={feedback === 'unhelpful'}
        title="Helpful"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className={`p-1 rounded-full transition-colors ${
          feedback === 'unhelpful'
            ? 'text-red-600 bg-red-100'
            : isDarkMode
            ? 'hover:bg-gray-800 text-gray-400'
            : 'hover:bg-gray-100 text-gray-500'
        } ${feedback === 'helpful' ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={feedback === 'helpful'}
        title="Not helpful"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
};