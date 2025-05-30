import { 
  Cuboid as Cube, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw, 
  Grid3X3, 
  MousePointer, 
  Home,
  Crosshair 
} from 'lucide-react';
import { useModelStore } from '../store/modelStore';

export const ViewerControls = () => {
  const { 
    viewerState, 
    setViewerMode, 
    resetCamera, 
    fitToView, 
    toggleGrid,
    toggleAxes 
  } = useModelStore();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-2 border border-gray-200/50">
      <div className="flex flex-col gap-2">
        <button 
          className={`p-2 rounded-lg ${
            viewerState.mode === 'select' 
              ? 'bg-blue-100 text-blue-600' 
              : 'hover:bg-gray-100'
          }`}
          title="Select"
          onClick={() => setViewerMode('select')}
        >
          <MousePointer size={20} />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg" 
          title="Home View"
          onClick={resetCamera}
        >
          <Home size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg" 
          title="Fit to View"
          onClick={fitToView}
        >
          <Maximize size={20} />
        </button>
        <button 
          className={`p-2 rounded-lg ${
            viewerState.isGridVisible 
              ? 'bg-blue-100 text-blue-600' 
              : 'hover:bg-gray-100'
          }`}
          title="Toggle Grid"
          onClick={toggleGrid}
        >
          <Grid3X3 size={20} />
        </button>
        <button 
          className={`p-2 rounded-lg ${
            viewerState.showAxes 
              ? 'bg-blue-100 text-blue-600' 
              : 'hover:bg-gray-100'
          }`}
          title="Toggle Axes"
          onClick={toggleAxes}
        >
          <Crosshair size={20} />
        </button>
      </div>
    </div>
  );
};