import { CostEstimatorOutput } from './dualModeCostEstimatorV3';

export function formatCostForGPTResponse(
  quantity: number,
  material: string,
  mode: string,
  estimate: CostEstimatorOutput
): string {
  const formatCurrency = (value: number) => 
    `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const totalProjectCost = estimate.totalCost * quantity;

  let modeDescription = '';
  switch (mode) {
    case 'Prototyping':
      modeDescription = '(Optimized for rapid iteration and design validation)';
      break;
    case 'Bridge':
      modeDescription = '(Balanced for medium-volume production with flexible tooling)';
      break;
    case 'Production':
      modeDescription = '(Optimized for high-volume manufacturing efficiency)';
      break;
    default:
      modeDescription = '(Standard manufacturing mode)';
  }

  return `💰 Manufacturing Cost Analysis

${mode} Mode ${modeDescription}

Basic Manufacturing Costs (per unit):
• Material and Processing: ${formatCurrency(estimate.basicCost)}
${estimate.toolingCost ? `• Tooling (amortized): ${formatCurrency(estimate.toolingCost / quantity)}` : ''}
${estimate.setupCost ? `• Setup (amortized): ${formatCurrency(estimate.setupCost / quantity)}` : ''}
• Total Unit Cost: ${formatCurrency(estimate.totalCost)}

Total Project Cost (${quantity.toLocaleString()} units): ${formatCurrency(totalProjectCost)}

Recommendations:
${estimate.recommendations.map(rec => `• ${rec}`).join('\n')}

Would you like to explore cost optimization opportunities or discuss alternative manufacturing approaches?`;
}