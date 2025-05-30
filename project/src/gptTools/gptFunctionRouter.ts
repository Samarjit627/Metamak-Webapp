import { Metadata } from '@/types/Metadata';

// ✅ Move to .env or config.ts
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const GPT_MODEL = 'gpt-4';
const API_KEY = process.env.OPENAI_API_KEY || '';

export async function callGPTFunction(tool: 'dfm' | 'cost' | 'tooling' | 'process', metadata: Metadata): Promise<string> {
  const prompt = generatePromptForTool(tool, metadata);

  try {
    const response = await fetch(GPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: GPT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Nirman, a precise, friendly AI copilot for manufacturing and design decisions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      console.error(`[GPT] API error: ${response.status} - ${response.statusText}`);
      return `⚠️ GPT request failed: ${response.statusText}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '⚠️ GPT response was empty.';
  } catch (error) {
    console.error('[GPT] Unexpected error:', error);
    return '⚠️ Unexpected GPT error. Please try again later.';
  }
}

function generatePromptForTool(tool: string, metadata: Metadata): string {
  const baseInfo = `Part Info:\n- Material: ${metadata.material}\n- Quantity: ${metadata.quantity}\n- Application: ${metadata.application}\n- Location: ${metadata.location}\n- Dimensions: ${JSON.stringify(metadata.dimensions)}\n- Surface Finish: ${metadata.surfaceFinish}`;

  switch (tool) {
    case 'dfm':
      return `${baseInfo}\n\nRun a DFM check. Flag issues like thin walls, undercuts, bad draft angles, sharp corners.`;
    case 'cost':
      return `${baseInfo}\n\nEstimate cost per unit across Indian cities (like Pune, Ahmedabad, Chennai) based on this metadata.`;
    case 'tooling':
      return `${baseInfo}\n\nSuggest optimal tooling strategy: mold type, die options, jigs, etc. Include lead time.`;
    case 'process':
      return `${baseInfo}\n\nSuggest best manufacturing processes based on quantity, material, and geometry.`;
    default:
      return `${baseInfo}\n\nGenerate a helpful summary.`;
  }
}
