import { DFMParameters } from '../functions/dfmRiskFunctions';

export const dfmRiskFunction = {
  name: 'analyzeDFMRisks',
  description: 'Analyzes Design for Manufacturing (DFM) risks based on part geometry and manufacturing parameters',
  parameters: {
    type: 'object',
    properties: {
      wallThickness: {
        type: 'number',
        description: 'Minimum wall thickness in millimeters'
      },
      draftAngle: {
        type: 'number',
        description: 'Minimum draft angle in degrees'
      },
      hasUndercuts: {
        type: 'boolean',
        description: 'Whether the part has undercuts'
      },
      complexity: {
        type: 'number',
        description: 'Geometric complexity score (0-1)'
      },
      volume: {
        type: 'number',
        description: 'Part volume in cubic millimeters'
      },
      material: {
        type: 'string',
        description: 'Material type (e.g., metal, plastic)'
      },
      process: {
        type: 'string',
        description: 'Manufacturing process'
      }
    },
    required: ['wallThickness', 'draftAngle', 'hasUndercuts']
  }
};

export const estimateToolingFunction = {
  name: 'estimateTooling',
  description: 'Estimates tooling costs based on part metadata',
  parameters: {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        description: 'Part metadata including material, volume, complexity, and tolerances',
        properties: {
          material: { type: 'string' },
          volume: { type: 'number' },
          complexity: { type: 'number' },
          toleranceClass: { type: 'string' }
        },
        required: ['material', 'volume', 'complexity', 'toleranceClass']
      }
    },
    required: ['metadata']
  }
};

export const recommendManufacturingProcessFunction = {
  name: 'recommendManufacturingProcess',
  description: 'Recommends the most suitable manufacturing process based on part metadata',
  parameters: {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        description: 'Part metadata including material, volume, complexity, and tolerances',
        properties: {
          material: { type: 'string' },
          volume: { type: 'number' },
          complexity: { type: 'number' },
          toleranceClass: { type: 'string' }
        },
        required: ['material', 'volume']
      }
    },
    required: ['metadata']
  }
};

export const suggestToolingApproachFunction = {
  name: 'suggestToolingApproach',
  description: 'Suggests the best tooling approach based on part metadata',
  parameters: {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        description: 'Part metadata including material, volume, complexity, and tolerances',
        properties: {
          material: { type: 'string' },
          volume: { type: 'number' },
          complexity: { type: 'number' },
          tolerance: { type: 'string' },
          undercuts: { type: 'boolean' },
          quantity: { type: 'number' }
        },
        required: ['material', 'volume', 'complexity']
      }
    },
    required: ['metadata']
  }
};