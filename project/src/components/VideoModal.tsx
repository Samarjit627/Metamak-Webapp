import React from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  processName: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, processName }) => {
  if (!isOpen) return null;

  const handleWatchVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(videoUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {processName} Process Demonstration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 flex flex-col items-center justify-center">
          <p className="text-gray-600 mb-6 text-center">
            Click below to watch the {processName} demonstration video on YouTube
          </p>
          <button
            onClick={handleWatchVideo}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Play size={20} />
            Watch Video on YouTube
          </button>
        </div>
      </div>
    </div>
  );
};