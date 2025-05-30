import React, { useState, useRef, useEffect } from 'react';
import { useModelStore } from '../store/modelStore';
import { Ruler, Box, Layers, GripHorizontal, Paintbrush, Info, ChevronDown } from 'lucide-react';

const VDI_SCALE = {
  'VDI 12': { roughness: 0.4, description: 'Mirror Finish', process: 'Polishing' },
  'VDI 15': { roughness: 0.6, description: 'Fine Ground', process: 'Fine Grinding' },
  'VDI 18': { roughness: 0.8, description: 'Ground', process: 'Precision Grinding' },
  'VDI 21': { roughness: 1.6, description: 'Smooth', process: 'Finish Machining' },
  'VDI 24': { roughness: 2.2, description: 'Semi-Smooth', process: 'Semi-Finish Machining' },
  'VDI 27': { roughness: 3.2, description: 'Medium', process: 'Medium Machining' },
  'VDI 30': { roughness: 4.5, description: 'Semi-Rough', process: 'Rough Machining' },
  'VDI 33': { roughness: 6.3, description: 'Rough', process: 'EDM' },
  'VDI 36': { roughness: 9.0, description: 'Very Rough', process: 'Rough EDM' },
  'VDI 39': { roughness: 12.5, description: 'Coarse', process: 'Sand Casting' }
} as const;

export const SurfaceAnalysis = () => {
  const { selectedParts } = useModelStore();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showVDIInfo, setShowVDIInfo] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (panelRef.current && headerRef.current) {
          const parentRect = panelRef.current.parentElement?.getBoundingClientRect();
          if (parentRect) {
            const newX = Math.min(
              Math.max(0, e.clientX - parentRect.left - dragOffset.x),
              parentRect.width - panelRef.current.offsetWidth
            );
            const newY = Math.min(
              Math.max(0, e.clientY - parentRect.top - dragOffset.y),
              parentRect.height - panelRef.current.offsetHeight
            );
            setPosition({ x: newX, y: newY });
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      };

      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };

  if (selectedParts.length === 0) return null;

  const selectedPart = selectedParts[0];
  if (!selectedPart || !selectedPart.geometry) return null;

  const surfaceFinish = {
    vdiGrade: 'VDI 21',
    type: 'Machined',
    description: 'Precision machined surface with directional lay pattern',
    texture: 'Directional',
    processingMethod: VDI_SCALE['VDI 21'].process,
    characteristics: [
      { name: 'VDI Class', value: 'VDI 21' },
      { name: 'Ra Value', value: `${VDI_SCALE['VDI 21'].roughness} μm` },
      { name: 'Surface Type', value: VDI_SCALE['VDI 21'].description },
      { name: 'Process', value: VDI_SCALE['VDI 21'].process }
    ],
    recommendations: [
      'Suitable for functional surfaces',
      'Good for wear resistance',
      'Optimal for paint adhesion',
      'Meets general engineering requirements'
    ]
  };

  const surfaceData = {
    roughness: `Ra ${VDI_SCALE['VDI 21'].roughness} μm`,
    flatness: '0.05 mm',
    parallelism: '0.02 mm',
    perpendicularity: '0.03 mm'
  };

  const dimensions = {
    length: '171.70 mm',
    width: '165.97 mm',
    height: '66.28 mm',
    holes: [
      { diameter: '8.5 mm', depth: '12 mm', position: 'Top Left' },
      { diameter: '6.2 mm', depth: '10 mm', position: 'Bottom Right' }
    ],
    features: [
      { type: 'Pocket', depth: '5 mm', area: '45 × 30 mm' },
      { type: 'Fillet', radius: '3 mm', location: 'All Corners' }
    ]
  };

  return (
    <div
      ref={panelRef}
      className={`absolute bg-white rounded-lg shadow-xl border border-gray-200 select-none transition-all duration-300`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10,
        width: '320px',
        height: isExpanded ? '400px' : '48px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div
        ref={headerRef}
        className="flex items-center justify-between p-3 border-b border-gray-200 cursor-grab bg-white"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Part Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {selectedPart.name || 'Selected Part'}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronDown
              size={20}
              className={`transform transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div 
        className={`flex-1 overflow-y-auto p-3 space-y-4 transition-all duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Paintbrush size={16} className="text-blue-600" />
              Surface Finish (VDI 3400)
            </h3>
            <button
              onClick={() => setShowVDIInfo(!showVDIInfo)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Info size={16} />
            </button>
          </div>

          {showVDIInfo && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg text-sm">
              <h4 className="font-medium text-blue-900 mb-1">VDI 3400 Scale</h4>
              <div className="space-y-1 text-blue-800">
                <p>Industry standard scale for surface finish:</p>
                <ul className="text-xs space-y-1">
                  <li>• VDI 12-18: Fine finish (Ra 0.4-0.8 μm)</li>
                  <li>• VDI 21-27: Normal finish (Ra 1.6-3.2 μm)</li>
                  <li>• VDI 30-39: Rough finish (Ra 4.5-12.5 μm)</li>
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">{surfaceFinish.type}</span>
                <span className="text-xs text-blue-700 px-2 py-0.5 bg-blue-100 rounded-full">
                  {surfaceFinish.vdiGrade}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {surfaceFinish.characteristics.map((char, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-600 text-xs">{char.name}</span>
                  <div className="font-medium">{char.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Layers size={16} className="text-blue-600" />
            Surface Analysis
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(surfaceData).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600 capitalize">{key}:</span>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Ruler size={16} className="text-blue-600" />
            Critical Dimensions
          </h3>
          <div className="space-y-2">
            <div className="bg-gray-50 p-2 rounded">
              <div className="grid grid-cols-3 gap-2">
                {['length', 'width', 'height'].map(dim => (
                  <div key={dim}>
                    <span className="text-gray-600 text-xs capitalize">{dim}</span>
                    <div className="font-medium text-sm">{dimensions[dim]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-600 text-xs block mb-1">Features</span>
              {dimensions.features.map((feature, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{feature.type}</span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({feature.type === 'Fillet' ? `R${feature.radius}` : feature.area})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Box size={16} className="text-blue-600" />
            Manufacturing Notes
          </h3>
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            <ul className="list-disc list-inside space-y-1">
              <li>All unspecified radii: 0.5 mm max</li>
              <li>Break all sharp edges: 0.2 mm × 45°</li>
              <li>Surface finish: {surfaceData.roughness} unless noted</li>
              <li>General tolerance: ±0.1 mm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};