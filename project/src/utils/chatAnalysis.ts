import { Message } from '../store/chatStore';
import debug from 'debug';

// Initialize debug logger
export const logger = debug('app:chatAnalysis');

interface Intent {
  type: 'application' | 'volume' | 'material' | 'tolerance' | 'question' | 'unknown';
  confidence: number;
  entities: {
    numbers: number[];
    materials: string[];
    tolerances: string[];
    applications: string[];
  };
}

export function analyzeUserInput(input: string, context: Message[] = []): Intent {
  logger('Analyzing user input:', { input, contextLength: context.length });

  const normalizedInput = input.toLowerCase().trim();
  
  // Initialize entities with empty arrays
  const entities = {
    numbers: extractNumbers(normalizedInput),
    materials: extractMaterials(normalizedInput),
    tolerances: extractTolerances(normalizedInput),
    applications: extractApplications(normalizedInput)
  };

  // Determine intent based on input and entities
  const intent = determineIntent(normalizedInput, entities, context);

  logger('Analysis result:', { intent, entities });
  return {
    type: intent.type,
    confidence: intent.confidence,
    entities
  };
}

function determineIntent(input: string, entities: any, context: Message[]): { type: Intent['type']; confidence: number } {
  const patterns = {
    application: [
      /used for/i,
      /purpose/i,
      /application/i,
      /designed to/i,
      /function/i,
      /will be used/i
    ],
    volume: [
      /how many/i,
      /quantity/i,
      /volume/i,
      /units/i,
      /pieces/i,
      /production/i
    ],
    material: [
      /material/i,
      /made of/i,
      /metal/i,
      /plastic/i,
      /strength/i,
      /properties/i
    ],
    tolerance: [
      /tolerance/i,
      /accuracy/i,
      /precision/i,
      /dimension/i,
      /measurement/i
    ]
  };

  let maxConfidence = 0;
  let detectedIntent: Intent['type'] = 'unknown';

  // Check each pattern category
  for (const [intentType, patternList] of Object.entries(patterns)) {
    const matches = patternList.filter(pattern => pattern.test(input));
    const confidence = matches.length / patternList.length;
    
    if (confidence > maxConfidence) {
      maxConfidence = confidence;
      detectedIntent = intentType as Intent['type'];
    }
  }

  // Check for questions
  if (input.includes('?') || input.startsWith('what') || input.startsWith('how')) {
    if (maxConfidence < 0.8) {
      detectedIntent = 'question';
      maxConfidence = 0.9;
    }
  }

  logger('Determined intent:', { type: detectedIntent, confidence: maxConfidence });
  return {
    type: detectedIntent,
    confidence: maxConfidence
  };
}

function extractNumbers(input: string): number[] {
  const matches = input.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

function extractMaterials(input: string): string[] {
  const materials = [
    'metal',
    'steel',
    'aluminum',
    'plastic',
    'rubber',
    'stainless steel',
    'titanium',
    'brass',
    'copper'
  ];

  return materials.filter(material => input.includes(material));
}

function extractTolerances(input: string): string[] {
  const matches = input.match(/±?\s*\d+(\.\d+)?\s*(?:mm|cm|m|μm)/g);
  return matches || [];
}

function extractApplications(input: string): string[] {
  const applications = [
    'automotive',
    'aerospace',
    'medical',
    'consumer',
    'industrial',
    'electronics',
    'machinery'
  ];

  return applications.filter(app => input.includes(app));
}