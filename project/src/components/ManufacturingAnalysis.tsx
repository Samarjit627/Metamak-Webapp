import React, { useState, useEffect } from 'react';
import { useModelStore } from '../store/modelStore';
import { useUserInputStore } from '../store/userInputStore';
import { analyzePart } from '../utils/manufacturingAnalysis';
import { PartAnalysis } from '../types/manufacturing';
import { manufacturingLocations, getLocationCostFactors } from '../data/manufacturingLocations';
import { materialCategories, getMaterialLabel, getMaterialOption } from '../data/materials';
import { Bar } from 'react-chartjs-2';
import { VideoModal } from './VideoModal';
import { dualModeCostEstimatorV3 } from '../utils/dualModeCostEstimatorV3';
import { CostAnalysisPanel } from './CostAnalysisPanel';
import { CostModeBanner } from './CostModeBanner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  Settings, 
  AlertTriangle, 
  MapPin, 
  BarChart3, 
  DollarSign, 
  Factory, 
  Info, 
  Tag, 
  ChevronDown, 
  FileType, 
  Zap, 
  ArrowRight, 
  Box, 
  Gauge, 
  Layers, 
  PenTool as Tool, 
  Clock, 
  Sparkles, 
  CheckCircle,
  Play
} from 'lucide-react';
import { PartAnalysisPanel } from './PartAnalysisPanel';
import { processVideos } from '../data/processVideos';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import DFMGPTExplanation from './DFMGPTExplanation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type TabType = 'overview' | 'costs' | 'processes' | 'analysis';

export const ManufacturingAnalysis = () => {
  const { 
    selectedParts,
    cadAnalysis,
    modelFile,
    fileType,
    setManufacturingMetadata,
    setBomItems
  } = useModelStore();

  const {
    material,
    materialSubtype,
    grade,
    location,
    quantity,
    setLocation,
    setQuantity
  } = useUserInputStore();

  const [analyses, setAnalyses] = useState<PartAnalysis[]>([]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [showMaterialInfo, setShowMaterialInfo] = useState(false);
  const [showGradeSelector, setShowGradeSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('processes');
  const [videoModalState, setVideoModalState] = useState({
    isOpen: false,
    videoUrl: '',
    processName: ''
  });

  const materialCategory = React.useMemo(() => 
    materialCategories.find(cat => cat.type === material),
    [material]
  );

  const materialOptions = React.useMemo(() => 
    materialCategory?.options || [],
    [materialCategory]
  );

  const currentMaterialOption = React.useMemo(() => 
    getMaterialOption(material, materialSubtype),
    [material, materialSubtype]
  );

  const materialGrades = React.useMemo(() => 
    currentMaterialOption?.grades || [],
    [currentMaterialOption]
  );

  const currentGrade = React.useMemo(() => 
    materialGrades.find(g => g.grade === grade),
    [materialGrades, grade]
  );

  const locationFactors = React.useMemo(() => 
    getLocationCostFactors(selectedCity),
    [selectedCity]
  );

  const handleVideoClick = (processName: string) => {
    const video = processVideos[processName];
    if (video) {
      setVideoModalState({
        isOpen: true,
        videoUrl: video.videoUrl,
        processName: video.processName
      });
    }
  };

  useEffect(() => {
    setManufacturingMetadata({
      material,
      materialSubtype,
      materialGrade: grade,
      location: selectedCity,
      quantity
    });
  }, [material, materialSubtype, grade, selectedCity, quantity, setManufacturingMetadata]);

  const formatCost = (cost: number | undefined): string => {
    if (typeof cost !== 'number' || !isFinite(cost)) return 'N/A';
    const value = currency === 'INR' ? cost : cost / 83;
    return currency === 'INR' 
      ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
      : `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (!selectedParts.length && (!modelFile || fileType !== 'dxf')) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const fetchDFMAnalysis = async () => {
      try {
        if (!cadAnalysis) {
          throw new Error('CAD analysis not available');
        }

        const processKey = material.toLowerCase() === 'metal' && quantity >= 1000 
          ? 'die_casting'
          : material.toLowerCase() === 'plastic' && quantity >= 1000
          ? 'injection_molding'
          : material.toLowerCase() === 'plastic' && quantity < 100
          ? '3d_printing_fdm'
          : 'cnc_metal';

        const costEstimate = dualModeCostEstimatorV3({
          processKey,
          quantity,
          volumeCm3: cadAnalysis.volume,
          material
        });

        // If on analysis tab and at least one part, call backend for DFM summary
        if (activeTab === 'analysis' && selectedParts.length > 0) {
          // For now, only analyze the first selected part
          const part = selectedParts[0];
          // Use part.geometry or fallback to cadAnalysis.geometry
          const geometry = part.geometry || cadAnalysis.geometry;
          const processType = processKey;

          // Serialize geometry for backend
          let serializedGeometry = null;
          try {
            // Dynamically import to avoid circular deps
            const { serializeGeometry } = await import('../utils/geometrySerialization');
            serializedGeometry = serializeGeometry(geometry);
            if (!serializedGeometry || !serializedGeometry.positions || !serializedGeometry.indices) {
              if (typeof window !== 'undefined' && (window.DEBUG_DFM || process.env.NODE_ENV === 'development')) {
                console.error('[DFM DEBUG] Geometry serialization failed: missing positions or indices', serializedGeometry);
              }
            } else {
              if (typeof window !== 'undefined' && (window.DEBUG_DFM || process.env.NODE_ENV === 'development')) {
                console.log('[DFM DEBUG] Serialized geometry:', {
                  positions: serializedGeometry.positions.slice(0, 30), // log first 30
                  indices: serializedGeometry.indices.slice(0, 30),
                  positionsLength: serializedGeometry.positions.length,
                  indicesLength: serializedGeometry.indices.length
                });
              }
            }
          } catch (e) {
            if (typeof window !== 'undefined' && (window.DEBUG_DFM || process.env.NODE_ENV === 'development')) {
              console.error('[DFM DEBUG] Error during geometry serialization:', e);
            }
          }

          // Log API payload
          if (typeof window !== 'undefined' && (window.DEBUG_DFM || process.env.NODE_ENV === 'development')) {
            console.log('[DFM DEBUG] API Payload:', {
              part_geometry: serializedGeometry,
              process_type: processType
            });
          }
          try {
            const response = await axios.post('/api/dfm/analysis', {
              part_geometry: serializedGeometry,
              process_type: processType
            });
            const dfmResult = response.data;
            setAnalyses([{ ...dfmResult, dualCostEstimate: costEstimate }]);
          } catch (apiError) {
            console.error('Error fetching DFM summary from backend:', apiError);
            setError('Failed to fetch DFM summary from backend.');
            setAnalyses([]);
          }
        } else {
          // Local analysis for other tabs
          const updatedAnalyses = selectedParts.map(part => {
            const analysis = analyzePart(
              part,
              quantity,
              material,
              materialSubtype,
              grade
            );

            return {
              ...analysis,
              recommendedProcesses: analysis.recommendedProcesses.map(process => ({
                ...process,
                locationFactors: getLocationCostFactors(selectedCity)
              })),
              dualCostEstimate: costEstimate
            };
          });
          setAnalyses(updatedAnalyses);
        }

        setError(null);

        // Update BOM items (from local analysis for now)
        const newBomItems = selectedParts.map((part, idx) => {
          const analysis = (activeTab === 'analysis' && analyses[0]) ? analyses[0] : (analyses[idx] || {});
          return {
            partId: analysis.id || part.id,
            name: analysis.name || part.name || 'Unnamed Part',
            quantity,
            material: getMaterialLabel(material, materialSubtype),
            materialSubtype,
            materialGrade: grade,
            process: analysis.recommendedProcesses?.[0]?.name || 'Undefined',
            estimatedCost: analysis.dualCostEstimate?.totalCost || 0,
            notes: `Complexity: ${(analysis.complexity || 0).toFixed(2)}`,
            location: selectedCity
          };
        });
        setBomItems(newBomItems);
      } catch (error) {
        console.error('Error in manufacturing analysis:', error);
        setError('Failed to analyze manufacturing parameters. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchDFMAnalysis();
  }, [selectedParts, quantity, material, materialSubtype, grade, selectedCity, cadAnalysis, setBomItems, modelFile, fileType, activeTab]);

  const chartData = {
    labels: analyses.map(a => a.name || 'Unnamed Part'),
    datasets: [
      {
        label: 'Complexity Score',
        data: analyses.map(a => a.complexity || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: `Estimated Cost Per Unit (${currency === 'INR' ? '₹' : '$'})`,
        data: analyses.map(a => {
          const cost = currency === 'INR' ? a.estimatedCost : a.estimatedCost / 83;
          return isFinite(cost) ? cost : null;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Part Analysis'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => {
            if (!isFinite(value)) return 'N/A';
            return value.toLocaleString();
          }
        }
      }
    }
  };

  const tabs = [
    { id: 'processes', label: 'Manufacturing', icon: Factory },
    { id: 'costs', label: 'Cost Analysis', icon: DollarSign },
    { id: 'analysis', label: 'Part Analysis', icon: Box },
    { id: 'overview', label: 'Overview', icon: BarChart3 }
  ];

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200/50">
      <div className="flex-none p-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Manufacturing Analysis</h2>
          <button 
            onClick={() => setCurrency(curr => curr === 'INR' ? 'USD' : 'INR')}
            className="p-2 hover:bg-gray-200 rounded-full"
            title="Toggle Currency"
          >
            <Settings size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-blue-600" />
              Manufacturing Location
            </h3>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {manufacturingLocations.map(location => (
                  <option key={location.city} value={location.city}>
                    {location.city}, {location.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Tag size={16} className="text-blue-600" />
              Material Specifications
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type
                </label>
                <select
                  value={material}
                  onChange={(e) => {
                    const newMaterial = e.target.value as 'metal' | 'plastic' | 'rubber' | 'wood';
                    const category = materialCategories.find(cat => cat.type === newMaterial);
                    if (category && category.options.length > 0) {
                      useUserInputStore.getState().setMaterial(newMaterial);
                      useUserInputStore.getState().setMaterialSubtype(category.options[0].value);
                      useUserInputStore.getState().setGrade(category.options[0].grades?.[0]?.grade || '');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {materialCategories.map(category => (
                    <option key={category.type} value={category.type}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Material Subtype
                  </label>
                  <button 
                    onClick={() => setShowMaterialInfo(!showMaterialInfo)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Info size={14} className="inline mr-1" />
                    Material info
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={materialSubtype}
                    onChange={(e) => {
                      const subtype = e.target.value;
                      const option = getMaterialOption(material, subtype);
                      useUserInputStore.getState().setMaterialSubtype(subtype);
                      if (option?.grades?.length > 0) {
                        useUserInputStore.getState().setGrade(option.grades[0].grade);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {materialOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {showMaterialInfo && currentMaterialOption && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                    <p className="text-gray-700 mb-2">{currentMaterialOption.description}</p>
                    
                    {currentMaterialOption.properties && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {currentMaterialOption.properties.density && (
                          <div>
                            <span className="text-gray-500">Density:</span>{' '}
                            <span className="font-medium">{currentMaterialOption.properties.density} g/cm³</span>
                          </div>
                        )}
                        {currentMaterialOption.properties.tensileStrength && (
                          <div>
                            <span className="text-gray-500">Tensile Strength:</span>{' '}
                            <span className="font-medium">{currentMaterialOption.properties.tensileStrength}</span>
                          </div>
                        )}
                        {currentMaterialOption.properties.meltingPoint && (
                          <div>
                            <span className="text-gray-500">Melting Point:</span>{' '}
                            <span className="font-medium">{currentMaterialOption.properties.meltingPoint}</span>
                          </div>
                        )}
                        {currentMaterialOption.properties.hardness && (
                          <div>
                            <span className="text-gray-500">Hardness:</span>{' '}
                            <span className="font-medium">{currentMaterialOption.properties.hardness}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2">
                  <button 
                    onClick={() => setShowGradeSelector(!showGradeSelector)}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Tag size={14} className="mr-1" />
                    Material grade
                    <ChevronDown size={14} className={`ml-1 transition-transform ${showGradeSelector ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showGradeSelector && materialGrades.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Select Material Grade
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => useUserInputStore.getState().setGrade(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {materialGrades.map((grade) => (
                          <option key={grade.grade} value={grade.grade}>
                            {grade.grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    {currentGrade && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-blue-100">
                        <div>
                          <span className="text-gray-500 text-xs">Applications:</span>
                          <p className="text-xs font-medium">{currentGrade.applications}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Properties:</span>
                          <p className="text-xs font-medium">{currentGrade.properties}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Price:</span>
                          <p className="text-xs font-medium">
                            {currency === 'INR' 
                              ? `₹${currentGrade.pricePerKg.toLocaleString('en-IN')}/kg` 
                              : `$${(currentGrade.pricePerKg / 83).toLocaleString('en-US', { maximumFractionDigits: 2 })}/kg`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Factory size={16} className="text-blue-600" />
              Manufacturing Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Production Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={1000000}
                  value={quantity}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 1;
                    if (newValue < 1) {
                      setQuantity(1);
                      setError('Quantity must be at least 1');
                    } else if (newValue > 1000000) {
                      setQuantity(1000000);
                      setError('Maximum quantity is 1,000,000');
                    } else {
                      setQuantity(newValue);
                      setError(null);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 mt-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center px-4 py-2 space-x-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Analyzing parts...</p>
              </div>
            </div>
          ) : selectedParts.length === 0 && (!modelFile || fileType !== 'dxf') ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              {fileType === 'dxf' ? (
                <div className="text-center">
                  <FileType size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Upload a DXF file to analyze manufacturing processes</p>
                </div>
              ) : (
                <div className="text-center">
                  <p>Select parts to analyze manufacturing processes</p>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center text-red-600">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                {error}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'processes' && analyses.map((analysis) => (
                <div key={analysis.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {analysis.name || 'Unnamed Part'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Material:</span>
                      <div className="font-medium">
                        {getMaterialLabel(material, materialSubtype)}
                        {grade && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({grade})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Volume:</span>
                      <div className="font-medium">{(analysis.volume || 0).toFixed(2)} cm³</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Complexity:</span>
                      <div className="font-medium">{(analysis.complexity || 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Tolerances:</span>
                      <div className="font-medium">{analysis.tolerances || '±0.1mm'}</div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-3">Recommended Processes:</h4>
                  {analysis.recommendedProcesses?.map((process, index) => (
                    <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{process.name}</span>
                          <button
                            onClick={() => handleVideoClick(process.name)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-full text-sm"
                          >
                            <Play size={14} />
                            Process Video
                          </button>
                        </div>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {((process.suitabilityScore || 0) * 100).toFixed(0)}% Match
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Lead Time:</span>
                          <div className="font-medium">{process.leadTime}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Min. Quantity:</span>
                          <div className="font-medium">{process.minimumQuantity?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost per Unit:</span>
                          <div className="font-medium text-blue-600">{formatCost(process.estimatedCost)}</div>
                        </div>
                      </div>

                      {process.locationFactors && (
                        <div className="mt-3 border-t pt-3">
                          <h5 className="font-medium text-gray-800 mb-2">Location Cost Factors:</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Labor:</span>
                              <div className="font-medium">
                                {((process.locationFactors.labor || 0) * 100).toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Energy:</span>
                              <div className="font-medium">
                                {((process.locationFactors.energy || 0) * 100).toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Transportation:</span>
                              <div className="font-medium">
                                {((process.locationFactors.transportation || 0) * 100).toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Overhead:</span>
                              <div className="font-medium">
                                {((process.locationFactors.overhead || 0) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <>
                        <div className="text-sm mt-3">
                          <div className="text-gray-600 mb-1">Advantages:</div>
                          <ul className="list-disc list-inside text-gray-800">
                            {process.advantages?.map((adv, i) => (
                              <li key={i}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      </>

                    </div>
                <>
                  <div className="text-sm mt-3">
                    <div className="text-gray-600 mb-1">Advantages:</div>
                    <ul className="list-disc list-inside text-gray-800">
                      {process.advantages?.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                </>

              </div>
            ))}
          </div>
        ))}
            </div>
          )}
        </div>
      </div>

      <VideoModal 
        isOpen={videoModalState.isOpen}
        onClose={() => setVideoModalState(prev => ({ ...prev, isOpen: false }))}
        videoUrl={videoModalState.videoUrl}
        processName={videoModalState.processName}
      />
    </div>
  );
};