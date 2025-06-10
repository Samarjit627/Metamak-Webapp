// agentHub.ts
import { FixAgent } from "./FixAgent";
import { CostCompareAgent } from "./CostCompareAgent";
import { ToleranceReviewAgent } from "./ToleranceReviewAgent";
import { IntentMapperAgent } from "./IntentMapperAgent";
import { PartMemory } from "./models/memory.model";

export async function triggerAgents(partId: string, memory: PartMemory) {
  const actions = [];

  if (memory.dfmFindings?.length) {
    actions.push(FixAgent(memory));
  }
  if (memory.material && memory.process && memory.quantity) {
    actions.push(CostCompareAgent(memory));
  }
  if (memory.toleranceInsights && Object.keys(memory.toleranceInsights).length > 0) {
    actions.push(ToleranceReviewAgent(memory));
  }

  // TODO: Add reflection once user feedback is tracked

  const results = await Promise.all(actions);
  return results.flat();
}
