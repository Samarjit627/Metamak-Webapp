import { getGPTResponse } from "./callGPT";
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:gptNarrator');

interface NarrationInput {
  material: string;
  subtype: string;
  grade: string;
  quantity: number;
  region: string;
  functionality: string;
  process: string;
  toolingCost: number;
  unitCost: number;
  dfmRisks: string[];
}

export async function generateSmartNarration(input: NarrationInput): Promise<string> {
  try {
    logger('Generating smart narration for:', input);

    const prompt = `
You're a senior manufacturing engineer. Here is the part context:

- Material: ${input.material} (${input.subtype}, Grade: ${input.grade})
- Functionality: ${input.functionality}
- Quantity: ${input.quantity} units
- Region: ${input.region}
- Recommended Process: ${input.process}
- Tooling Cost: ₹${input.toolingCost.toFixed(0)}
- Unit Cost: ₹${input.unitCost.toFixed(2)}
- DFM Risks: ${input.dfmRisks.join(", ") || "None"}

Write a 4-5 sentence professional explanation on:
1. Why this process was chosen
2. What risks or considerations the user should know
3. Any alternative suggestion briefly
4. Closing reassurance like: "Let me know if you want to explore alternatives"
`;

    const response = await getGPTResponse(null, prompt);
    logger('Smart narration generated successfully');
    return response.content.trim();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error generating smart narration:', errorMsg);
    throw new Error(`Failed to generate smart narration: ${errorMsg}`);
  }
}