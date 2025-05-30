import { BufferGeometry, Vector3, Box3 } from 'three';
import { PartAnalysis, ManufacturingProcess } from '../types/manufacturing';
import { analyzeGeometry } from './geometryAnalysis';
import { getMaterialCostFactor, getMaterialGrade } from '../data/materials';
import { analyzeDXFComplexity, estimateDXFVolume, getDXFFeatures } from './dxfLoader';
import { getLocationCostFactors, getLocationSpecialization } from '../data/manufacturingLocations';
import { estimateCost } from './costEstimator';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:manufacturingAnalysis');

function getRecommendedProcesses(
  material: string,
  quantity: number,
  complexity: number
): ManufacturingProcess[] {
  const processes: ManufacturingProcess[] = [];
  const isHighComplexity = complexity > 0.7;
  const isMediumComplexity = complexity > 0.4 && complexity <= 0.7;

  // Define volume categories
  const isLowVolume = quantity < 100;
  const isMediumVolume = quantity >= 100 && quantity < 1000;
  const isHighVolume = quantity >= 1000;

  switch (material.toLowerCase()) {
    case 'metal':
      if (isLowVolume) {
        processes.push({
          name: 'CNC Machining',
          suitabilityScore: 0.9,
          advantages: [
            'Excellent for prototypes',
            'High precision',
            'No tooling costs',
            'Complex geometries possible'
          ],
          disadvantages: [
            'Higher cost per unit',
            'Longer processing time'
          ],
          estimatedCost: 0,
          setupCost: 5000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '1-2 weeks',
          minimumQuantity: 1
        });
        processes.push({
          name: 'Metal DMLS',
          suitabilityScore: 0.8,
          advantages: [
            'Complex geometries possible',
            'No tooling required',
            'Quick turnaround'
          ],
          disadvantages: [
            'Higher cost per unit',
            'Limited material options',
            'Surface finish may need post-processing'
          ],
          estimatedCost: 0,
          setupCost: 3000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '1-2 weeks',
          minimumQuantity: 1
        });
      } else if (isMediumVolume) {
        processes.push({
          name: 'Investment Casting',
          suitabilityScore: 0.85,
          advantages: [
            'Good for medium volumes',
            'Excellent surface finish',
            'Complex shapes possible'
          ],
          disadvantages: [
            'Higher tooling costs',
            'Longer lead time'
          ],
          estimatedCost: 0,
          setupCost: 150000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '3-4 weeks',
          minimumQuantity: 100
        });
        processes.push({
          name: 'CNC Machining',
          suitabilityScore: 0.75,
          advantages: [
            'High precision',
            'No minimum quantity',
            'Design flexibility'
          ],
          disadvantages: [
            'Higher unit cost',
            'Longer processing time'
          ],
          estimatedCost: 0,
          setupCost: 5000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '2-3 weeks',
          minimumQuantity: 1
        });
      } else {
        processes.push({
          name: 'Die Casting',
          suitabilityScore: 0.95,
          advantages: [
            'Excellent for high volumes',
            'Fast production rate',
            'Good dimensional accuracy'
          ],
          disadvantages: [
            'High tooling cost',
            'Minimum quantity requirements'
          ],
          estimatedCost: 0,
          setupCost: 250000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '4-6 weeks',
          minimumQuantity: 1000
        });
      }
      break;

    case 'plastic':
      if (isLowVolume) {
        processes.push({
          name: '3D Printing (FDM/SLA)',
          suitabilityScore: 0.9,
          advantages: [
            'No tooling required',
            'Quick turnaround',
            'Design flexibility'
          ],
          disadvantages: [
            'Limited material options',
            'Layer lines visible',
            'Higher unit cost'
          ],
          estimatedCost: 0,
          setupCost: 1000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '2-3 days',
          minimumQuantity: 1
        });
        processes.push({
          name: 'Vacuum Forming',
          suitabilityScore: 0.7,
          advantages: [
            'Low tooling cost',
            'Quick setup',
            'Good for simple shapes'
          ],
          disadvantages: [
            'Limited to sheet materials',
            'Limited detail',
            'Thickness variations'
          ],
          estimatedCost: 0,
          setupCost: 15000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '1-2 weeks',
          minimumQuantity: 10
        });
      } else if (isMediumVolume) {
        processes.push({
          name: 'Vacuum Forming',
          suitabilityScore: 0.85,
          advantages: [
            'Lower tooling cost than injection molding',
            'Good for medium runs',
            'Suitable for larger parts'
          ],
          disadvantages: [
            'Limited material options',
            'Limited to sheet materials'
          ],
          estimatedCost: 0,
          setupCost: 50000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '2-3 weeks',
          minimumQuantity: 100
        });
      } else {
        processes.push({
          name: 'Injection Molding',
          suitabilityScore: 0.95,
          advantages: [
            'Excellent for high volumes',
            'Fast cycle times',
            'High quality finish'
          ],
          disadvantages: [
            'High tooling cost',
            'Design restrictions',
            'Minimum quantity requirements'
          ],
          estimatedCost: 0,
          setupCost: 100000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '4-6 weeks',
          minimumQuantity: 1000
        });
      }
      break;

    case 'rubber':
      if (isLowVolume) {
        processes.push({
          name: 'Compression Molding',
          suitabilityScore: 0.85,
          advantages: [
            'Low tooling cost',
            'Quick turnaround',
            'Good for prototypes'
          ],
          disadvantages: [
            'Limited material options',
            'Higher unit cost'
          ],
          estimatedCost: 0,
          setupCost: 20000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '1-2 weeks',
          minimumQuantity: 1
        });
      } else {
        processes.push({
          name: 'Compression Molding',
          suitabilityScore: 0.9,
          advantages: [
            'Good for high volumes',
            'Excellent material properties',
            'Lower tooling cost than injection'
          ],
          disadvantages: [
            'Longer cycle times',
            'Flash removal required'
          ],
          estimatedCost: 0,
          setupCost: 75000,
          laborCost: 0,
          materialCost: 0,
          overheadCost: 0,
          leadTime: '3-4 weeks',
          minimumQuantity: 500
        });
      }
      break;

    case 'wood':
      processes.push({
        name: 'CNC Wood Routing',
        suitabilityScore: 0.9,
        advantages: [
          'High precision',
          'Complex patterns possible',
          'Good for all volumes'
        ],
        disadvantages: [
          'Material waste',
          'Limited to flat stock'
        ],
        estimatedCost: 0,
        setupCost: 5000,
        laborCost: 0,
        materialCost: 0,
        overheadCost: 0,
        leadTime: '1-2 weeks',
        minimumQuantity: 1
      });
      break;

    default:
      processes.push({
        name: 'CNC Machining',
        suitabilityScore: 0.7,
        advantages: [
          'Versatile process',
          'Good for prototypes',
          'High precision'
        ],
        disadvantages: [
          'Higher cost for high volumes',
          'Material waste'
        ],
        estimatedCost: 0,
        setupCost: 5000,
        laborCost: 0,
        materialCost: 0,
        overheadCost: 0,
        leadTime: '2-3 weeks',
        minimumQuantity: 1
      });
  }

  // Calculate costs for each process
  return processes.map(process => ({
    ...process,
    locationFactors: getLocationCostFactors('Ahmedabad')
  }));
}

export function analyzePart(
  part: any,
  quantity: number,
  material: string,
  materialSubtype: string = '',
  materialGrade: string = ''
): PartAnalysis {
  logger('Analyzing part:', { material, materialSubtype, materialGrade, quantity });

  try {
    if (!part || !part.geometry) {
      throw new Error('Invalid part: missing geometry');
    }

    const geometry = part.geometry;
    const analysis = analyzeGeometry(geometry);

    // Calculate costs using the cost estimator
    const costEstimate = estimateCost({
      volume: analysis.volume || 0,
      surfaceArea: analysis.surfaceArea || 0,
      quantity,
      materialType: material,
      materialSubtype,
      materialGrade,
      complexity: analysis.complexity || 0.5
    });

    // Calculate bounding box
    geometry.computeBoundingBox();
    const box = new Box3().setFromBufferAttribute(geometry.attributes.position);
    const size = new Vector3();
    box.getSize(size);

    // Get recommended processes based on material and quantity
    const recommendedProcesses = getRecommendedProcesses(material, quantity, analysis.complexity || 0.5);

    // Update costs for each process using the estimator
    recommendedProcesses.forEach(process => {
      const processEstimate = estimateCost({
        volume: analysis.volume || 0,
        surfaceArea: analysis.surfaceArea || 0,
        quantity,
        materialType: material,
        materialSubtype,
        materialGrade,
        complexity: analysis.complexity || 0.5,
        setupCost: process.setupCost
      });

      process.estimatedCost = processEstimate.costPerUnit;
      process.materialCost = processEstimate.breakdown.materialCost;
      process.laborCost = processEstimate.breakdown.complexityMultiplier * 100; // Example logic
      process.overheadCost = processEstimate.breakdown.finishingCost;
    });

    logger('Analysis completed successfully');

    return {
      id: part.uuid || Math.random().toString(36).substr(2, 9),
      name: part.name || 'Unnamed Part',
      volume: analysis.volume || 0,
      surfaceArea: analysis.surfaceArea || 0,
      boundingBox: {
        width: size.x || 0,
        height: size.y || 0,
        depth: size.z || 0
      },
      complexity: analysis.complexity || 0.5,
      recommendedProcesses,
      material: material,
      materialType: material as 'metal' | 'plastic' | 'rubber' | 'wood',
      materialSubtype: materialSubtype,
      materialGrade: materialGrade,
      estimatedCost: costEstimate.costPerUnit,
      tolerances: '±0.1mm',
      features: analysis.features
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error analyzing part:', errorMsg);
    
    // Return a default analysis with error information
    return {
      id: part?.uuid || Math.random().toString(36).substr(2, 9),
      name: part?.name || 'Unnamed Part',
      volume: 0,
      surfaceArea: 0,
      boundingBox: {
        width: 0,
        height: 0,
        depth: 0
      },
      complexity: 0.5,
      recommendedProcesses: [{
        name: 'Error',
        suitabilityScore: 0,
        advantages: ['Unable to analyze part'],
        disadvantages: ['Error: ' + errorMsg],
        estimatedCost: 0,
        setupCost: 0,
        laborCost: 0,
        materialCost: 0,
        overheadCost: 0,
        leadTime: 'N/A',
        minimumQuantity: 0
      }],
      material: material,
      materialType: material as 'metal' | 'plastic' | 'rubber' | 'wood',
      materialSubtype: materialSubtype,
      materialGrade: materialGrade,
      estimatedCost: 0,
      tolerances: '±0.1mm',
      error: errorMsg
    };
  }
}

export function analyzeDXFPart(
  dxfData: any,
  quantity: number,
  material: string,
  materialSubtype: string = '',
  materialGrade: string = ''
): PartAnalysis {
  if (!dxfData || !dxfData.entities || !dxfData.geometry) {
    throw new Error('Invalid DXF data');
  }

  const complexity = analyzeDXFComplexity(dxfData.entities);
  const volume = estimateDXFVolume(dxfData.boundingBox);
  const features = getDXFFeatures(dxfData.entities);

  // Calculate costs using the new cost calculation logic
  const costEstimate = estimateCost({
    volume,
    surfaceArea: 0,
    quantity,
    materialType: material,
    complexity
  });

  // Get location cost factors
  const locationFactors = getLocationCostFactors('Ahmedabad');

  // Get recommended processes for 2D parts
  const recommendedProcesses = [
    {
      name: 'Laser Cutting',
      suitabilityScore: 0.95,
      advantages: [
        'Fast turnaround',
        'Cost-effective for sheet metal',
        'High precision'
      ],
      disadvantages: [
        'Limited to 2D shapes',
        'Material thickness limitations'
      ],
      estimatedCost: costEstimate.costPerUnit,
      setupCost: costEstimate.setupCost,
      laborCost: costEstimate.breakdown.materialCost * 0.3,
      materialCost: costEstimate.breakdown.materialCost,
      overheadCost: costEstimate.breakdown.finishingCost,
      leadTime: '1-2 weeks',
      minimumQuantity: 1,
      locationFactors
    },
    {
      name: 'Waterjet Cutting',
      suitabilityScore: 0.85,
      advantages: [
        'No heat affected zone',
        'Wide range of materials',
        'Thick materials possible'
      ],
      disadvantages: [
        'Slower than laser cutting',
        'Higher operating costs'
      ],
      estimatedCost: costEstimate.costPerUnit * 1.2,
      setupCost: costEstimate.setupCost,
      laborCost: costEstimate.breakdown.materialCost * 0.3,
      materialCost: costEstimate.breakdown.materialCost,
      overheadCost: costEstimate.breakdown.finishingCost,
      leadTime: '1-2 weeks',
      minimumQuantity: 1,
      locationFactors
    }
  ];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: 'DXF Part',
    volume,
    surfaceArea: 0,
    boundingBox: dxfData.boundingBox,
    complexity,
    recommendedProcesses,
    material,
    materialType: material as 'metal' | 'plastic' | 'rubber' | 'wood',
    materialSubtype,
    materialGrade,
    estimatedCost: costEstimate.costPerUnit,
    tolerances: features.hasTightTolerances ? '±0.05mm' : '±0.1mm'
  };
}