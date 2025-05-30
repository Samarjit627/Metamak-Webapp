import { CostEstimatorOutput } from './dualModeCostEstimatorV3';

export function formatCostForGPTResponse(
  quantity: number,
  material: string,
  process: string,
  estimate: CostEstimatorOutput
): string {
  const {
    basicCost,
    toolingCost = 0,
    setupCost = 0,
    totalCost,
    mode,
    recommendations
  } = estimate;

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const getModeDescription = (mode: string): string => {
    switch (mode) {
      case 'Prototyping':
        return 'early design validation and quick iterations';
      case 'Bridge':
        return 'medium-volume production with flexible tooling';
      case 'Production':
        return 'optimized high-volume manufacturing';
      default:
        return 'manufacturing';
    }
  };

  const totalProjectCost = totalCost * quantity;

  return `💰 Manufacturing Cost Analysis

📦 Cost Summary for ${quantity.toLocaleString()} unit${quantity > 1 ? 's' : ''} using ${material} via ${process}

🔹 Production Mode: ${mode}
🔹 Basic Unit Cost: ${formatCurrency(basicCost)}
🔹 All-Inclusive Unit Cost: ${formatCurrency(totalCost)}

One-Time Costs:
• Tooling Investment: ${formatCurrency(toolingCost)}
• Setup Cost: ${formatCurrency(setupCost)}

📊 Total Project Cost: ${formatCurrency(totalProjectCost)}

Key Recommendations:
${recommendations.map(rec => `• ${rec}`).join('\n')}

💡 This pricing is optimized for ${getModeDescription(mode)}.
Would you like to explore cost optimization opportunities or discuss alternative manufacturing approaches?`;
}