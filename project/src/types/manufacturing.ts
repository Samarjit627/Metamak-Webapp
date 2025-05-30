// Material types
export interface MaterialGrade {
  grade: string;
  applications: string;
  pricePerKg: number;
  properties: string;
}

export interface MaterialOption {
  value: string;
  label: string;
  description: string;
  properties?: {
    density?: number;
    tensileStrength?: string;
    meltingPoint?: string;
    hardness?: string;
  };
  costFactor: number;
  grades?: MaterialGrade[];
}

export interface MaterialCategory {
  type: 'metal' | 'plastic' | 'rubber' | 'wood';
  label: string;
  options: MaterialOption[];
}

// Location types
export interface ManufacturingLocation {
  city: string;
  state: string;
  costIndex: number;
  laborRate: number;
  energyCost: number;
  transportationFactor: number;
  specializations: string[];
}

export interface LocationCostFactors {
  labor: number;
  energy: number;
  transportation: number;
  overhead: number;
}

// Manufacturing process types
export interface ManufacturingProcess {
  name: string;
  suitabilityScore: number;
  advantages: string[];
  disadvantages?: string[];
  estimatedCost: number;
  setupCost: number;
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  leadTime: string;
  minimumQuantity: number;
  locationFactors?: LocationCostFactors;
}

// Part analysis types
export interface PartAnalysis {
  id: string;
  name: string;
  volume: number;
  surfaceArea: number;
  boundingBox: {
    width: number;
    height: number;
    depth: number;
  };
  complexity: number;
  recommendedProcesses: ManufacturingProcess[];
  material: string;
  materialType: 'metal' | 'plastic' | 'rubber' | 'wood';
  materialSubtype: string;
  materialGrade: string;
  estimatedCost: number;
  tolerances: string;
  tooling?: ToolingDetails;
  sustainability?: SustainabilityMetrics;
  quality?: QualityAnalysis;
  dualCostEstimate?: any;
  features?: any;
  error?: string;
}

// Tooling types
export interface ToolingCost {
  setup: number;
  materials: number;
  labor: number;
  maintenance: number;
  total: number;
  amortization: number;
  costPerPart: number;
}

export interface ToolingDetails {
  type: string;
  complexity: number;
  estimatedLife: number;
  maintenanceInterval: number;
  specifications: {
    dimensions: Vector3;
    material: string;
    surfaceFinish: string;
    tolerance: string;
  };
  costs: ToolingCost;
}

// Sustainability types
export interface SustainabilityMetrics {
  materialEfficiency: number;
  energyScore: number;
  carbonFootprint: number;
  recyclability: number;
  wasteReduction: string[];
}

// Quality types
export interface QualityAnalysis {
  criticalFeatures: string[];
  inspectionPoints: string[];
  defectRisks: string[];
  toleranceRanges: {
    [key: string]: {
      nominal: number;
      upper: number;
      lower: number;
    };
  };
}

// Material info types
export interface MaterialInfo {
  type: string;
  category: string;
  grade?: string;
  specification?: string;
  treatment?: string;
  confidence: number;
}

// Vector3 type for TypeScript compatibility
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Add these new types to the existing types file
export interface GeometryMetadata {
  volume?: number;
  surfaceArea?: number;
  complexity?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface MaterialMetadata {
  type: string;
  subtype: string;
  grade: string;
}

export interface ManufacturingPlanInput {
  partName: string;
  geometry?: GeometryMetadata;
  material?: MaterialMetadata;
  quantity?: number;
}

export interface ManufacturingPlanOutput {
  summary: string;
  recommendedProcess: string;
  toolingStrategy: string;
  costEstimate: string;
  regionalSuggestion: string;
}

export interface Vendor {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  specialties: string[];
  certifications: string[];
  rating: number;
  reviews: number;
  minOrderValue: number;
  leadTime: string;
  description: string;
  processes: string[];
  materials: string[];
  image: string;
}