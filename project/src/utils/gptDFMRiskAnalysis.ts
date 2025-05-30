import { OpenAI } from 'openai';
import { DFMParameters } from '../functions/dfmRiskFunctions';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function gptDFMRiskAnalysis(params: DFMParameters): Promise<{ gptSummary: string; risks?: string[]; recommendations?: string[] }> {
  console.log('[GPT-DFM] Entered gptDFMRiskAnalysis with params:', params);
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('[GPT-DFM] OpenAI API key:', key ? '***' + key.slice(-4) : 'undefined');
  const prompt = `You are a DFM (Design for Manufacturability) expert. Analyze the following part and manufacturing parameters. Reply in this precise format (no prose, no explanations, no generic advice):\n\nDFM Analysis Results:\n\nManufacturability Score: <number 0-100>%\nSeverity: <LOW/MEDIUM/HIGH>\n\nPart Features:\n• Min Wall Thickness: <number>mm\n• Max Draft Angle: <number>°\n• Undercuts Present: <Yes/No>\n• Complexity Score: <number 0-100>%\nHoles:\n<One bullet per hole: • Face <index>: Diameter: <number>mm>\nThin Walls:\n<One bullet per thin wall: • Face <index>: Thickness: <number>mm>\nSharp Corners:\n<One bullet per sharp corner: • Face <index>: Angle: <number>°>\n\nRecommendations:\n<2-3 crisp, technical, actionable bullets, each max 15 words>\n\nParameters: ${JSON.stringify(params)}\n\nOutput ONLY the above format, nothing else.`;
  try {
    console.log('[GPT-DFM] Before OpenAI call');
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a DFM expert for Indian manufacturing. Only output in the specified format.' },
          { role: 'user', content: prompt }
        ]
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('GPT DFM analysis timed out after 30s')), 30000))
    ]);
    console.log('[GPT-DFM] After OpenAI call:', response);
    const content = response.choices[0]?.message?.content || '';
    console.log('[GPT-DFM] Raw GPT content:', content);
    return { gptSummary: content };
  } catch (err) {
    console.error('[GPT-DFM] OpenAI call failed:', err);
    return { gptSummary: `⚠️ GPT DFM analysis failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}
