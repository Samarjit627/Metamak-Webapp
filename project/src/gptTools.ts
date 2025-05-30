import { DFMParameters } from './functions/dfmRiskFunctions';

export const gptTools = {
  DFM: {
    functionName: "analyzeDFMRisksWithGPT",
    description: "Analyzes Design for Manufacturing (DFM) risks using both local rules and GPT insights for richer recommendations.",
    parameters: {
      type: 'object',
      properties: {
        wallThickness: { type: 'number' },
        draftAngle: { type: 'number' },
        hasUndercuts: { type: 'boolean' },
        complexity: { type: 'number' },
        volume: { type: 'number' },
        material: { type: 'string' },
        process: { type: 'string' }
      },
      required: []
    }
  },
  PROCESS: {
    functionName: "recommendManufacturingProcess",
    description: "Recommends the most suitable manufacturing process based on part metadata",
    parameters: {
      type: 'object',
      properties: {
        material: { type: 'string' },
        materialSubtype: { type: 'string' },
        materialGrade: { type: 'string' },
        quantity: { type: 'number' },
        geometryComplexity: { type: 'string' },
        volume: { type: 'number' }
      },
      required: ['material', 'materialSubtype', 'materialGrade', 'quantity']
    }
  },
  TOOLING: {
    functionName: "estimateTooling",
    description: "Estimates tooling costs based on part metadata",
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
  },
  APPROACH: {
    functionName: "suggestToolingApproach",
    description: "Suggests the best tooling approach based on part metadata",
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
  },
  PLAN: {
    functionName: "autoManufacturingPlan",
    description: "Generates a complete manufacturing plan including process selection, tooling, and costs",
    parameters: {
      type: 'object',
      properties: {
        material: { type: 'string' },
        subtype: { type: 'string' },
        grade: { type: 'string' },
        quantity: { type: 'number' },
        region: { type: 'string' },
        functionality: { type: 'string' },
        geometryComplexity: {
          type: 'string',
          enum: ['Low', 'Medium', 'High']
        }
      },
      required: ['material', 'quantity', 'region']
    }
  },
  COST: {
    functionName: "costAnalysis",
    description: "Provides a detailed manufacturing cost analysis with insights, cost drivers, risks, trade-offs, and recommendations.",
    parameters: {
      type: 'object',
      properties: {
        processKey: { type: 'string', description: 'Manufacturing process key' },
        quantity: { type: 'number', description: 'Production quantity' },
        volumeCm3: { type: 'number', description: 'Part volume in cm^3' },
        material: { type: 'string', description: 'Material type' }
      },
      required: ['processKey', 'quantity', 'volumeCm3', 'material']
    }
  }
};

export type GPTTool = keyof typeof gptTools;
export type GPTToolFunction = typeof gptTools[GPTTool]['functionName'];