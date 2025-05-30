import { DFMParameters, DFMRiskAnalysis } from './dfmRiskFunctions';
import { runGPTTool } from '../utils/runGPTTool';

/**
 * Hybrid DFM analysis: runs local DFM and augments with GPT insights.
 * Returns both local and GPT-based recommendations for richer feedback.
 */
export async function analyzeDFMRisksWithGPT(params: DFMParameters & { _skipHybrid?: boolean }): Promise<DFMRiskAnalysis & { gptSummary?: string }> {
  console.log('[DFM-GPT] Called with params:', params);

  // 1. Run local DFM analysis
  const { analyzeDFMRisks } = await import('./dfmRiskFunctions');
  let localResult: DFMRiskAnalysis;
  try {
    console.log('[DFM-GPT] Before local DFM');
    localResult = await analyzeDFMRisks(params);
    console.log('[DFM-GPT] After local DFM:', localResult);
  } catch (err) {
    console.error('[DFM-GPT] Local DFM failed:', err);
    const fallback = { risks: ['Local DFM failed'], recommendations: [], gptSummary: 'Local DFM error.', severity: 'unknown', manufacturabilityScore: 0 };
    console.log('[DFM-GPT] Returning fallback result:', fallback);
    return fallback;
  }

  // 2. If _skipHybrid, return local only
  if (params._skipHybrid) {
    console.log('[DFM-GPT] _skipHybrid set, returning local only');
    return localResult;
  }

  // 3. Run GPT-powered DFM analysis with timeout
  let gptResult: any = {};
  try {
    console.log('[DFM-GPT] Before GPT call. OpenAI key defined:', !!import.meta.env.VITE_OPENAI_API_KEY);
    gptResult = await Promise.race([
      runGPTTool('DFM', { ...params, _skipHybrid: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Hybrid DFM GPT step timed out after 30s')), 30000))
    ]);
    console.log('[DFM-GPT] After GPT call:', gptResult);
    if (gptResult?.gptSummary?.includes('⚠️')) {
      // Surface GPT errors directly in the summary
      const result = {
        ...localResult,
        gptSummary: gptResult.gptSummary,
        risks: localResult.risks,
        recommendations: localResult.recommendations
      };
      console.log('[DFM-GPT] Returning hybrid result (GPT error):', result);
      return result;
    }
  } catch (err) {
    console.error('[DFM-GPT] GPT call failed:', err);
    gptResult = { gptSummary: `⚠️ GPT DFM analysis failed: ${err instanceof Error ? err.message : String(err)}` };
    const result = {
      ...localResult,
      gptSummary: gptResult.gptSummary,
      risks: localResult.risks,
      recommendations: localResult.recommendations
    };
    console.log('[DFM-GPT] Returning hybrid result (GPT catch):', result);
    return result;
  }

  // 4. Compose hybrid output
  try {
    const result = {
      ...localResult,
      gptSummary: gptResult?.gptSummary || gptResult?.content || '',
      risks: Array.from(new Set([...(localResult.risks || []), ...(gptResult.risks || [])])),
      recommendations: Array.from(new Set([...(localResult.recommendations || []), ...(gptResult.recommendations || [])]))
    };
    console.log('[DFM-GPT] Returning hybrid result:', result);
    return result;
  } catch (err) {
    console.error('[DFM-GPT] Compose failed:', err);
    const fallback = { ...localResult, gptSummary: '⚠️ Compose failed.' };
    console.log('[DFM-GPT] Returning fallback result:', fallback);
    return fallback;
  }
}
