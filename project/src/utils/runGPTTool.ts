import { gptTools, GPTTool } from '../gptTools';
import { OpenAI } from 'openai'; // Adjust import based on your setup
// Import actual tool implementations
import { analyzeDFMRisks } from '../functions/dfmRiskFunctions';
import { analyzeDFMRisksWithGPT } from '../functions/analyzeDFMRisksWithGPT';
import { recommendManufacturingProcess } from './recommendManufacturingProcess';
import { estimateTooling } from './toolingEstimator';
import { suggestToolingApproach } from './suggestToolingApproach';
import { autoManufacturingPlanAgent } from '../agents/autoManufacturingPlanAgent';
import { gptDFMRiskAnalysis } from './gptDFMRiskAnalysis';
import { dualModeCostEstimatorV3 } from './dualModeCostEstimatorV3';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true
});

// Map function names to actual implementations
// Map function names (from gptTools) to actual implementations
const toolFunctionMap: Record<string, Function> = {
  // DFM
  analyzeDFMRisks,
  analyzeDFMRisksWithGPT,
  DFM: gptDFMRiskAnalysis,
  // PROCESS
  recommendManufacturingProcess,
  PROCESS: recommendManufacturingProcess,
  // TOOLING
  estimateTooling,
  toolingAnalysis: estimateTooling,
  TOOLING: estimateTooling,
  // APPROACH
  suggestToolingApproach,
  APPROACH: suggestToolingApproach,
  // PLAN
  autoManufacturingPlan: autoManufacturingPlanAgent,
  PLAN: autoManufacturingPlanAgent,
  // COST
  costAnalysis: dualModeCostEstimatorV3,
  COST: dualModeCostEstimatorV3,
};

function normalizeArgs(toolName: string, args: any) {
  if (args && args._skipHybrid && toolName === 'analyzeDFMRisksWithGPT') {
    // If recursion guard is set, call local DFM only
    return toolFunctionMap['analyzeDFMRisks'](args);
  }
  // Flatten or extract fields as needed for each tool
  switch (toolName) {
    case 'analyzeDFMRisks':
      return args;
    case 'recommendManufacturingProcess':
    case 'PROCESS':
      // Ensure all required fields are present and mapped
      return {
        material: args.material || args.Material || '',
        materialSubtype: args.materialSubtype || args.subtype || '',
        materialGrade: args.materialGrade || args.grade || '',
        quantity: args.quantity || args.qty || 1,
        geometryComplexity: args.geometryComplexity || args.complexity || 'Medium',
      };
    case 'estimateTooling':
      // Tooling estimator may need process, material, quantity, volume, etc.
      return {
        material: args.material || args.Material || '',
        materialSubtype: args.materialSubtype || args.subtype || '',
        materialGrade: args.materialGrade || args.grade || '',
        quantity: args.quantity || args.qty || 1,
        process: args.process || args.processKey || '',
        volume: args.volume || args.partVolume || args.volumeCm3 || 0,
        geometryComplexity: args.geometryComplexity || args.complexity || 'Medium',
      };
    case 'suggestToolingApproach':
      return {
        material: args.material || args.Material || '',
        quantity: args.quantity || args.qty || 1,
        process: args.process || args.processKey || '',
        geometryComplexity: args.geometryComplexity || args.complexity || 'Medium',
      };
    case 'autoManufacturingPlan':
      return args;
    case 'costAnalysis':
    case 'COST':
      return {
        processKey: args.processKey || '',
        quantity: args.quantity || args.qty || 1,
        volumeCm3: args.volumeCm3 || args.partVolume || 0,
        material: args.material || args.Material || '',
      };
    case 'toolingAnalysis':
    case 'TOOLING':
      return {
        process: args.process || args.processKey || '',
        material: args.material || args.Material || '',
        quantity: args.quantity || args.qty || 1,
        volume: args.volume || args.partVolume || args.volumeCm3 || 0,
        geometryComplexity: args.geometryComplexity || args.complexity || 'Medium',
      };
    default:
      return args;
  }
}

function getMissingFields(obj: any, fields: string[]): string[] {
  return fields.filter(f => obj[f] === undefined || obj[f] === null || obj[f] === '');
}

export async function runGPTTool(toolName: GPTTool, inputs: any): Promise<any> {
  console.log('[runGPTTool] Called with toolName:', toolName, 'inputs:', inputs);
  const fn = toolFunctionMap[toolName];
  console.log('[runGPTTool] toolFunctionMap[toolName]:', fn ? fn.name : 'undefined');
  if (!fn) {
    console.error('[runGPTTool] No function found for toolName:', toolName);
    return { gptSummary: '[runGPTTool] No function found for toolName.' };
  }
  try {
    const result = await fn(inputs);
    console.log('[runGPTTool] Tool function result:', result);
    return result;
  } catch (err) {
    console.error('[runGPTTool] Tool function threw error:', err);
    return { gptSummary: `[runGPTTool] Tool function error: ${err instanceof Error ? err.message : String(err)}` };
  }
}
