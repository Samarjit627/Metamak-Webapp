import React, { useEffect } from 'react';
import { useModelStore } from '@/store/modelStore';
import { useUserInputStore } from '@/store/userInputStore';
import { calculateVolumeBasedCost } from '@/utils/costUtils';
import { suggestManufacturingProcesses } from '@/utils/processUtils';

const processVideos: Record<string, string> = {
  cnc_machining: 'https://www.youtube.com/embed/2rG3c5tpYBI',
  injection_molding: 'https://www.youtube.com/embed/YAPbQO9MxF0',
  compression_molding: 'https://www.youtube.com/embed/4sZtOeFPTX4',
  vacuum_forming: 'https://www.youtube.com/embed/MUoZJ8I3BrQ',
  sheet_metal: 'https://www.youtube.com/embed/6U6qKp0YxjU',
  rotational_molding: 'https://www.youtube.com/embed/jRfGgM9rkCE',
  investment_casting: 'https://www.youtube.com/embed/YW56OpCsgnc',
  "3d_printing": 'https://www.youtube.com/embed/F2ya7LsaTz4',
  laser_cutting: 'https://www.youtube.com/embed/Xt2HHkzB_P8',
  die_casting: 'https://www.youtube.com/embed/H0G3kYd1pSA',
};

export default function ManufacturingAnalysisPanel() {
  const { selectedPart, metadataMap } = useModelStore();
  const {
    material,
    materialSubtype,
    grade,
    application,
    location,
    quantity,
    setAllInputs
  } = useUserInputStore();

  // Sync CAD metadata to user input store atomically
  useEffect(() => {
    if (selectedPart && metadataMap[selectedPart]) {
      const metadata = metadataMap[selectedPart];
      // Log the CAD metadata for diagnosis
      console.log('CAD metadata for selected part:', metadata);
      setAllInputs({
        material: metadata.material || '',
        materialSubtype: metadata.materialSubtype || '',
        grade: metadata.grade || '',
        location: metadata.location || '',
        quantity: metadata.quantity || 1,
        application: metadata.application || '',
      });
      // Debug log to confirm
      setTimeout(() => {
        const state = useUserInputStore.getState();
        console.log('AFTER setAllInputs:', state);
      }, 500);
    }
  }, [selectedPart, metadataMap, setAllInputs]);

  if (!selectedPart || !metadataMap[selectedPart]) return <div className="p-4">Select a part to analyze manufacturing processes</div>;

  const metadata = metadataMap[selectedPart];
  const { volume, wallThickness, complexity, tolerances } = metadata;

  const baseCost = calculateVolumeBasedCost({ material, volume, quantity });
  const totalCost = baseCost * quantity;

  const { primary, alternatives } = suggestManufacturingProcesses({
    material,
    volume,
    quantity,
    wallThickness,
  });

  const renderProcessCard = (processKey: string, isPrimary = false) => (
    <div className="border p-4 rounded-xl shadow-sm bg-white">
      <h3 className="font-bold text-lg mb-1">{processKey.replace(/_/g, ' ').toUpperCase()}</h3>
      <iframe
        width="100%"
        height="200"
        src={processVideos[processKey] || ''}
        title={`${processKey} video`}
        frameBorder="0"
        allowFullScreen
        className="rounded"
      ></iframe>
      <p className="text-sm mt-2">{isPrimary ? 'Primary Suggested Method' : 'Alternative Option'}</p>
    </div>
  );

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto max-h-screen">
      {/* TEST SCROLL BLOCK - REMOVE AFTER VERIFICATION */}
      <div style={{height: 1200, background: '#e0e7ef', margin: '16px 0', borderRadius: 8, textAlign: 'center', lineHeight: '1200px', color: '#333', fontWeight: 'bold'}}>
        Scroll Test Block (1200px tall)
      </div>
      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <h2 className="font-semibold text-xl mb-2">Part Info</h2>
        <p><strong>Material:</strong> {material} ({grade})</p>
        <p><strong>Volume:</strong> {volume.toFixed(2)} cm³</p>
        <p><strong>Complexity:</strong> {complexity}</p>
        <p><strong>Tolerances:</strong> ±{tolerances}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <h2 className="font-semibold text-xl mb-2">Recommended Processes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderProcessCard(primary, true)}
          {alternatives.map((alt) => renderProcessCard(alt))}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <h2 className="font-semibold text-xl mb-2">Cost Analysis</h2>
        <p><strong>Base Cost (per unit):</strong> ₹{baseCost.toFixed(2)}</p>
        <p><strong>Total Cost ({quantity} units):</strong> ₹{totalCost.toFixed(2)}</p>
      </div>
    </div>
  );
}
