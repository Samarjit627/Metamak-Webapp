import React, { useState, useEffect, Suspense } from 'react';
import { HybridChatInterface } from './chat/HybridChatInterface';
import { Viewer3D } from './components/Viewer3D';
import { TopNavbar } from './components/TopNavbar';
import { ManufacturingAnalysis } from './components/ManufacturingAnalysis';
import { BottomToolbar } from './components/BottomToolbar';
import { BOMSidebar } from './components/BOMSidebar';
import { useModelStore } from './store/modelStore';
import { useThemeStore } from './store/themeStore';
import { ModelErrorBoundary } from './components/ErrorBoundary';
import { ChatButton } from './components/ChatButton';
import { ChatInterface } from './components/ChatInterface';

import { useDFMUIStore } from './store/dfmUIStore';
import DFMHeatmapModal from './components/DFMHeatmapModal';

function App() {
  const { isDarkMode } = useThemeStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isDFMHeatmapOpen } = useDFMUIStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`fixed inset-0 flex flex-col overflow-hidden ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#f5f5f7]'
    }`}>
      <TopNavbar />
      {isDFMHeatmapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[90vw] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <DFMHeatmapModal />
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => useDFMUIStore.getState().closeDFMAnalysis()}
              aria-label="Close DFM Heatmap"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 flex min-h-0 flex-row">
        {/* Chat Sidebar - 750px when open */}
        {isChatOpen && (
          <div className="h-full w-[750px] min-w-[750px] max-w-[900px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-30 flex flex-col transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
  <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Chat with your Co-Pilot</span>
  <button
    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
    onClick={() => setIsChatOpen(false)}
    aria-label="Close Chat Sidebar"
  >
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>
  </button>
</div>
            <div className="flex-1 overflow-y-auto">
              <ChatInterface isOpen={isChatOpen} />
            </div>
          </div>
        )}
        {/* Center: CAD Viewer always visible */}
        <div className={`flex-1 flex flex-col h-full min-h-0 transition-all duration-300 ease-in-out ${isChatOpen ? 'ml-0' : ''}`}>
          <ModelErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center w-full h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            }>
              <div className={`relative rounded-2xl shadow-sm transition-all duration-300 ease-in-out ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } w-full h-full min-h-0`}>
                <div className="absolute inset-0 h-full min-h-0">
                  <Viewer3D />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <BottomToolbar />
                </div>
                <BOMSidebar />
              </div>

            </Suspense>
          </ModelErrorBoundary>
        </div>
        {/* Right: Manufacturing Analysis Panel only if chat is closed */}
        {!isChatOpen && (
          <div className="w-[604px] min-w-[518px] max-w-[748px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-20 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto h-full">
            <ManufacturingAnalysis />
          </div>
        )}
      </div>
      <ChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen(true)} />
      {/* ManufacturingAnalysis Modal Overlay */}
      {/* Example: show modal if you have a boolean like isAnalysisOpen */}
      {/*
      {isAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-[90vw] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <ManufacturingAnalysis />
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => setIsAnalysisOpen(false)}
              aria-label="Close Analysis Modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
      */}
    </div>
  );
}

export default App;