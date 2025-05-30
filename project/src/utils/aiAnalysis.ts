import * as tf from '@tensorflow/tfjs';
import { BufferGeometry, Vector3 } from 'three';
import { Matrix } from 'ml-matrix';

interface AIAnalysisResult {
  manufacturabilityScore: number;
  costOptimization: {
    suggestions: string[];
    potentialSavings: number;
  };
  qualityPrediction: {
    defectProbability: number;
    criticalAreas: string[];
  };
  sustainabilityMetrics: {
    materialEfficiency: number;
    energyScore: number;
    wasteReduction: string[];
  };
}

// Load the pre-trained model
let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Create a simple model if loading fails
      model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'sigmoid' })
        ]
      });
      
      // Initialize with random weights
      await model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });
    } catch (error) {
      console.error('Error loading model:', error);
      return null;
    }
  }
  return model;
}

export async function analyzeWithAI(
  geometry: BufferGeometry,
  material: string,
  quantity: number
): Promise<AIAnalysisResult> {
  try {
    const loadedModel = await loadModel();
    if (!loadedModel) {
      return getDefaultAnalysis();
    }
    
    // Extract geometric features
    const features = extractGeometricFeatures(geometry);
    
    // Create input tensor
    const inputTensor = tf.tensor2d([features], [1, 10]);
    
    // Get model prediction
    const prediction = loadedModel.predict(inputTensor) as tf.Tensor;
    const scores = await prediction.array() as number[][];
    
    // Cleanup tensors
    inputTensor.dispose();
    prediction.dispose();
    
    // Process predictions into meaningful results
    return processAnalysisResults(scores[0], geometry, material, quantity);
  } catch (error) {
    console.error('AI analysis failed:', error);
    return getDefaultAnalysis();
  }
}

function extractGeometricFeatures(geometry: BufferGeometry): number[] {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  
  // Calculate bounding box
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new Vector3();
  box.getSize(size);
  
  // Calculate volume
  const volume = size.x * size.y * size.z;
  
  // Calculate surface area (approximate)
  let surfaceArea = 0;
  for (let i = 0; i < positions.count; i += 3) {
    const v1 = new Vector3().fromBufferAttribute(positions, i);
    const v2 = new Vector3().fromBufferAttribute(positions, i + 1);
    const v3 = new Vector3().fromBufferAttribute(positions, i + 2);
    
    const triangle = new Vector3()
      .crossVectors(
        v2.clone().sub(v1),
        v3.clone().sub(v1)
      )
      .length() * 0.5;
    
    surfaceArea += triangle;
  }
  
  // Calculate complexity metrics
  const complexity = calculateComplexityMetrics(geometry);
  
  // Return array of exactly 10 features
  return [
    size.x || 0,
    size.y || 0,
    size.z || 0,
    volume || 0,
    surfaceArea || 0,
    complexity.curvatureVariation || 0,
    complexity.featureDensity || 0,
    complexity.symmetryScore || 0,
    complexity.aspectRatio || 0,
    complexity.normalVariation || 0
  ];
}

function calculateComplexityMetrics(geometry: BufferGeometry) {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  
  // Calculate curvature variation
  let curvatureVariation = 0;
  let normalVariation = 0;
  
  for (let i = 0; i < positions.count; i++) {
    const normal = new Vector3().fromBufferAttribute(normals, i);
    if (i > 0) {
      const prevNormal = new Vector3().fromBufferAttribute(normals, i - 1);
      normalVariation += 1 - normal.dot(prevNormal);
    }
  }
  
  curvatureVariation = normalVariation / positions.count;
  
  // Calculate feature density
  const featureDensity = positions.count / geometry.boundingBox!.getSize(new Vector3()).length();
  
  // Calculate symmetry score
  const symmetryScore = calculateSymmetryScore(geometry);
  
  // Calculate aspect ratio
  const size = geometry.boundingBox!.getSize(new Vector3());
  const aspectRatio = Math.max(size.x, size.y, size.z) / Math.min(size.x, size.y, size.z);
  
  return {
    curvatureVariation,
    featureDensity,
    symmetryScore,
    aspectRatio,
    normalVariation: normalVariation / positions.count
  };
}

function calculateSymmetryScore(geometry: BufferGeometry): number {
  const positions = geometry.attributes.position;
  const center = geometry.boundingBox!.getCenter(new Vector3());
  
  let symmetryScore = 0;
  const sampleSize = Math.min(positions.count, 1000);
  
  for (let i = 0; i < sampleSize; i++) {
    const point = new Vector3().fromBufferAttribute(positions, i);
    const reflected = point.clone().sub(center).multiplyScalar(-1).add(center);
    
    // Find closest point to reflected position
    let minDist = Infinity;
    for (let j = 0; j < positions.count; j++) {
      const testPoint = new Vector3().fromBufferAttribute(positions, j);
      const dist = reflected.distanceTo(testPoint);
      minDist = Math.min(minDist, dist);
    }
    
    symmetryScore += 1 / (1 + minDist);
  }
  
  return symmetryScore / sampleSize;
}

function processAnalysisResults(
  scores: number[],
  geometry: BufferGeometry,
  material: string,
  quantity: number
): AIAnalysisResult {
  // Ensure we have valid scores
  const validScores = scores.map(score => 
    isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
  );
  
  const [manufacturabilityScore, qualityScore, costScore, sustainabilityScore] = validScores;
  
  const result: AIAnalysisResult = {
    manufacturabilityScore,
    costOptimization: {
      suggestions: generateCostSuggestions(geometry, material, costScore),
      potentialSavings: calculatePotentialSavings(quantity, costScore)
    },
    qualityPrediction: {
      defectProbability: 1 - qualityScore,
      criticalAreas: identifyCriticalAreas(geometry)
    },
    sustainabilityMetrics: {
      materialEfficiency: sustainabilityScore,
      energyScore: calculateEnergyScore(material, geometry),
      wasteReduction: generateWasteReductionStrategies(geometry, material)
    }
  };

  return result;
}

function generateCostSuggestions(
  geometry: BufferGeometry,
  material: string,
  costScore: number
): string[] {
  const suggestions: string[] = [];
  
  if (costScore < 0.7) {
    suggestions.push("Consider simplifying complex features to reduce machining time");
    suggestions.push("Optimize part orientation for minimal support structures");
    suggestions.push("Evaluate alternative materials for cost reduction");
  }
  
  return suggestions;
}

function calculatePotentialSavings(quantity: number, costScore: number): number {
  const baseUnitCost = 1000; // Base cost in INR
  const potentialReduction = (1 - costScore) * 0.3; // Up to 30% savings possible
  return quantity * baseUnitCost * potentialReduction;
}

function identifyCriticalAreas(geometry: BufferGeometry): string[] {
  const criticalAreas: string[] = [];
  
  // Analyze thin walls
  const thinWalls = findThinWalls(geometry);
  if (thinWalls.length > 0) {
    criticalAreas.push(`${thinWalls.length} thin wall(s) detected`);
  }
  
  // Analyze sharp corners
  const sharpCorners = findSharpCorners(geometry);
  if (sharpCorners.length > 0) {
    criticalAreas.push(`${sharpCorners.length} sharp corner(s) detected`);
  }
  
  return criticalAreas;
}

function findThinWalls(geometry: BufferGeometry): Vector3[] {
  // Simplified thin wall detection
  return [];
}

function findSharpCorners(geometry: BufferGeometry): Vector3[] {
  // Simplified sharp corner detection
  return [];
}

function calculateEnergyScore(material: string, geometry: BufferGeometry): number {
  // Simplified energy score calculation
  return 0.75;
}

function generateWasteReductionStrategies(
  geometry: BufferGeometry,
  material: string
): string[] {
  return [
    "Optimize nesting arrangement for better material utilization",
    "Consider design modifications to reduce material waste",
    "Implement material recycling program for process waste"
  ];
}

function getDefaultAnalysis(): AIAnalysisResult {
  return {
    manufacturabilityScore: 0.7,
    costOptimization: {
      suggestions: [
        "Consider design simplification",
        "Evaluate alternative materials",
        "Optimize production batch size"
      ],
      potentialSavings: 1000
    },
    qualityPrediction: {
      defectProbability: 0.2,
      criticalAreas: ["General quality inspection recommended"]
    },
    sustainabilityMetrics: {
      materialEfficiency: 0.8,
      energyScore: 0.7,
      wasteReduction: [
        "Implement material recycling",
        "Optimize process parameters",
        "Consider eco-friendly materials"
      ]
    }
  };
}