import debug from 'debug';

// Initialize debug logger
const logger = debug('app:textUtils');

export function extractNumericValue(text: string): number | null {
  try {
    const matches = text.match(/[-+]?\d*\.?\d+/);
    if (matches) {
      return parseFloat(matches[0]);
    }
    return null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error extracting numeric value:', errorMsg);
    return null;
  }
}