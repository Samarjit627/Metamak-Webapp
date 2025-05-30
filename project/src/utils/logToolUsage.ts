import debug from 'debug';

// Initialize debug logger
const logger = debug('app:logToolUsage');

interface LogToolUsageParams {
  tool: string;
  userId: string;
  timestamp: Date;
  status: "success" | "failure";
  inputs: Record<string, any>;
  output?: any;
  error?: any;
}

export function logToolUsage(params: LogToolUsageParams): void {
  try {
    logger(`Tool "${params.tool}" used by user "${params.userId}" with status "${params.status}"`);
    
    // Log detailed information
    logger('Tool Usage Details:', {
      ...params,
      timestamp: params.timestamp.toISOString()
    });

    // Store metrics for analysis
    storeMetrics(params);

  } catch (error) {
    logger('Error logging tool usage:', error);
  }
}

function storeMetrics(params: LogToolUsageParams) {
  try {
    // Get existing metrics from localStorage
    const metricsKey = 'gpt_tool_metrics';
    const existingMetrics = JSON.parse(localStorage.getItem(metricsKey) || '{}');

    // Update tool usage count
    const toolKey = params.tool;
    existingMetrics[toolKey] = existingMetrics[toolKey] || {
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      lastUsed: null
    };

    existingMetrics[toolKey].totalCalls++;
    if (params.status === 'success') {
      existingMetrics[toolKey].successCount++;
    } else {
      existingMetrics[toolKey].failureCount++;
    }
    existingMetrics[toolKey].lastUsed = params.timestamp.toISOString();

    // Store updated metrics
    localStorage.setItem(metricsKey, JSON.stringify(existingMetrics));
  } catch (error) {
    logger('Error storing metrics:', error);
  }
}

export function getToolMetrics(): Record<string, any> {
  try {
    const metricsKey = 'gpt_tool_metrics';
    return JSON.parse(localStorage.getItem(metricsKey) || '{}');
  } catch (error) {
    logger('Error retrieving metrics:', error);
    return {};
  }
}