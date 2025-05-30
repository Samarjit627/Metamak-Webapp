import { extractNumericValue } from '../textUtils';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:dimensionsParser');

export interface ParsedPDFMetadata {
  dimensions: string[];
  material?: string;
  tolerance?: string;
  hardness?: string;
  notes?: string[];
}

const dimensionPatterns = [
  /\b(\d+(\.\d+)?)(\s?mm|\s?cm|\s?in|\s?inch|\s?dia|\s?thk|\s?\u03c6)\b/gi,
  /\b(\u03c6|phi|diameter)\s*(\d+(\.\d+)?)/gi,
  /\b(thickness|width|height|length)\s*[:=]?\s*(\d+(\.\d+)?\s?(mm|cm|in|inch)?)\b/gi,
];

const materialKeywords = ['rubber', 'silicone', 'steel', 'aluminum', 'abs', 'pla', 'nylon', 'acrylic'];
const tolerancePatterns = [/DIN\s*ISO\s*\d+/gi, /\u00b1\s*\d+(\.\d+)?/g, /Tolerance\s*[:=]\s*.*?(\d+\.?\d*)/gi];
const hardnessPattern = /Shore\s*(A|D)?\s*:?\s*\d+/gi;

export function parseDimensionsFromOCRText(text: string): ParsedPDFMetadata {
  try {
    logger('Parsing dimensions from OCR text');
    
    const metadata: ParsedPDFMetadata = {
      dimensions: [],
      notes: []
    };

    // Clean text
    const cleaned = text.replace(/\s+/g, ' ');

    // Extract dimensions
    dimensionPatterns.forEach(pattern => {
      const matches = cleaned.match(pattern);
      if (matches) {
        metadata.dimensions.push(...matches.map(m => m.trim()));
      }
    });

    // Extract material
    for (const keyword of materialKeywords) {
      if (cleaned.toLowerCase().includes(keyword)) {
        metadata.material = keyword;
        break;
      }
    }

    // Tolerances
    for (const pattern of tolerancePatterns) {
      const matches = cleaned.match(pattern);
      if (matches) {
        metadata.tolerance = matches[0];
        break;
      }
    }

    // Hardness
    const hardness = cleaned.match(hardnessPattern);
    if (hardness) {
      metadata.hardness = hardness[0];
    }

    // Notes
    if (cleaned.includes('roughness')) {
      metadata.notes?.push('Surface finish / roughness mentioned');
    }
    if (cleaned.includes('thread')) {
      metadata.notes?.push('Thread callouts detected');
    }
    if (cleaned.includes('radius')) {
      metadata.notes?.push('Fillet / radius info present');
    }

    logger('Dimension parsing completed:', metadata);
    return metadata;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error parsing dimensions:', errorMsg);
    return {
      dimensions: [],
      notes: ['Error parsing dimensions from text']
    };
  }
}