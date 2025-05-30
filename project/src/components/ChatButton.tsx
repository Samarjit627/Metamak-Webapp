import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed left-6 bottom-6 z-50 flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all duration-300 ${
        isOpen ? 'scale-0' : 'scale-100'
      }`}
      aria-label="Chat with your Co-Pilot"
    >
      <MessageCircle size={24} className="text-white" />
      <span className="font-medium text-sm whitespace-nowrap pr-1">Chat with your Co-Pilot</span>
    </button>
  );
};