// designIntentModeler.ts
export type DesignIntent = {
  usage: string;
  environment?: string;
  aesthetics?: string;
  functionalNeeds?: string;
};

export function extractDesignIntent(input: string): DesignIntent {
  // Simple heuristic extraction for demo (replace with NLP/GPT for production)
  const usage = /for ([^,.]+)/i.exec(input)?.[1] || "general";
  const environment = /(outdoor|indoor|marine|high temperature)/i.exec(input)?.[1];
  const aesthetics = /(transparent|colorful|matte|glossy)/i.exec(input)?.[1];
  const functionalNeeds = /(waterproof|high strength|flexible|lightweight|insulating)/i.exec(input)?.[1];
  return { usage, environment, aesthetics, functionalNeeds };
}
