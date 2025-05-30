import { PlanOutput } from '../agents/autoManufacturingPlanAgent';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:formatAgenticPlan');

export function formatAgenticPlan(plan: any): string {
  try {
    if (!plan?.recommendedProcess || !plan?.unitCost) {
      throw new Error("Incomplete plan data");
    }

    const formattedPlan = `
🏭 Manufacturing Plan Generated

Process: ${plan.recommendedProcess}
Tooling: ${plan.toolingCost > 150000 ? '2-cavity mold' : 'Single cavity mold'}
Unit Cost: ₹${plan.unitCost?.toFixed(2)}
Total Cost: ₹${(plan.unitCost * plan.toolingCost).toLocaleString()}

Analysis:
${plan.dfmRisks?.length > 0 ? `• DFM Risks: ${plan.dfmRisks.join(', ')}` : '• No significant DFM risks identified'}
• ${plan.recommendedProcess} selected for optimal cost-volume balance
• ${plan.toolingCost > 150000 ? '2-cavity mold recommended for volume efficiency' : 'Single cavity mold suitable for volume'}
• Material sourcing optimized for ${plan.region || 'local'} supply chain

${plan.decisionNarrative || ''}

Would you like more details about any aspect of this plan?`.trim();

    logger('Formatted plan:', formattedPlan);
    return formattedPlan;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
    logger('Error formatting plan:', errorMsg);
    console.error("Plan-format error", err, plan);
    return "⚠️ Error formatting manufacturing plan. Please try again.";
  }
}