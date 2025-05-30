import * as pdfjsLib from 'pdfjs-dist';
import { logger } from './chatAnalysis';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface PDFAnalysisResult {
  text: string;
  dimensions: Array<{
    value: number;
    unit: string;
    type: 'linear' | 'diameter' | 'radius' | 'angle';
    tolerance?: {
      upper: number;
      lower: number;
    };
  }>;
  materials: Array<{
    type: string;
    grade?: string;
    specification?: string;
  }>;
  notes: string[];
  features: Array<{
    type: string;
    description: string;
  }>;
}

const ANALYSIS_TIMEOUT = 30000; // 30 seconds timeout

export async function analyzePDF(pdfData: ArrayBuffer): Promise<PDFAnalysisResult> {
  try {
    logger('Starting PDF analysis');

    if (!pdfData || pdfData.byteLength === 0) {
      throw new Error('Invalid or empty PDF data');
    }

    if (pdfData.byteLength > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('PDF file size exceeds 10MB limit');
    }

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF analysis timed out after 30 seconds')), ANALYSIS_TIMEOUT);
    });

    // Create the main analysis promise
    const analysisPromise = performPDFAnalysis(pdfData);

    // Race between timeout and analysis
    const result = await Promise.race([analysisPromise, timeoutPromise]) as PDFAnalysisResult;
    
    // Validate result
    if (!result.dimensions || !result.materials || !result.notes || !result.features) {
      throw new Error('PDF analysis returned incomplete results');
    }

    logger('PDF analysis completed successfully');
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in PDF analysis:', errorMsg);
    throw new Error(`PDF analysis failed: ${errorMsg}`);
  }
}

async function performPDFAnalysis(pdfData: ArrayBuffer): Promise<PDFAnalysisResult> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
      verbosity: 0
    });
    
    const pdf = await loadingTask.promise;
    
    let extractedText = '';
    const dimensions: PDFAnalysisResult['dimensions'] = [];
    const materials: PDFAnalysisResult['materials'] = [];
    const notes: string[] = [];
    const features: PDFAnalysisResult['features'] = [];

    // Process each page with timeout
    for (let i = 1; i <= pdf.numPages; i++) {
      const pagePromise = processPage(pdf, i);
      const pageResult = await Promise.race([
        pagePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Page ${i} processing timed out`)), 10000))
      ]);

      const { text, pageDimensions, pageMaterials, pageNotes, pageFeatures } = pageResult;
      
      extractedText += text + '\n';
      dimensions.push(...pageDimensions);
      materials.push(...pageMaterials);
      notes.push(...pageNotes);
      features.push(...pageFeatures);

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    if (!extractedText.trim()) {
      throw new Error('No text content extracted from PDF');
    }

    return {
      text: extractedText.trim(),
      dimensions,
      materials,
      notes,
      features
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in performPDFAnalysis:', errorMsg);
    throw new Error(`Failed to analyze PDF: ${errorMsg}`);
  }
}

async function processPage(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) {
  try {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    const pageDimensions = processDimensions(pageText);
    const pageMaterials = processMaterials(pageText);
    const pageNotes = processNotesAndFeatures(pageText, []);
    const pageFeatures = [];

    return {
      text: pageText,
      pageDimensions,
      pageMaterials,
      pageNotes,
      pageFeatures
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error processing page:', errorMsg);
    throw new Error(`Failed to process page ${pageNum}: ${errorMsg}`);
  }
}

function processDimensions(text: string): PDFAnalysisResult['dimensions'] {
  const dimensions: PDFAnalysisResult['dimensions'] = [];
  
  // Regular expressions for different dimension types
  const patterns = {
    linear: /(\d+(?:\.\d+)?)\s*(?:mm|cm|m|in)?(?:\s*[±∓]\s*(\d+(?:\.\d+)?))?/g,
    diameter: /[ØØ∅]\s*(\d+(?:\.\d+)?)\s*(?:mm|cm|m|in)?(?:\s*[±∓]\s*(\d+(?:\.\d+)?))?/g,
    radius: /R\s*(\d+(?:\.\d+)?)\s*(?:mm|cm|m|in)?(?:\s*[±∓]\s*(\d+(?:\.\d+)?))?/g,
    angle: /(\d+(?:\.\d+)?)\s*°(?:\s*[±∓]\s*(\d+(?:\.\d+)?))?/g
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      try {
        const value = parseFloat(match[1]);
        const tolerance = match[2] ? parseFloat(match[2]) : undefined;

        if (!isNaN(value)) {
          dimensions.push({
            value,
            unit: detectUnit(match[0]),
            type: type as 'linear' | 'diameter' | 'radius' | 'angle',
            ...(tolerance && {
              tolerance: {
                upper: value + tolerance,
                lower: value - tolerance
              }
            })
          });
        }
      } catch (error) {
        logger('Error processing dimension match:', error);
        // Continue processing other matches
      }
    }
  }

  return dimensions;
}

function processMaterials(text: string): PDFAnalysisResult['materials'] {
  const materials: PDFAnalysisResult['materials'] = [];
  
  // Common material specifications
  const materialPatterns = [
    // Steel grades
    /(?:AISI|SAE)\s*(1020|1045|4140|4340|316L?|304L?)/i,
    // Aluminum grades
    /(?:AL|ALUMINUM)\s*(6061-T6|7075-T6|5052|2024)/i,
    // Plastic materials
    /(?:ABS|PLA|PEEK|PETG|NYLON)/i,
    // General material mentions
    /(?:STEEL|ALUMINUM|PLASTIC|RUBBER|WOOD)\s*(?:GRADE\s*)?([A-Z0-9\-]+)?/i
  ];

  for (const pattern of materialPatterns) {
    const match = text.match(pattern);
    if (match) {
      materials.push({
        type: detectMaterialType(match[0]),
        grade: match[1],
        specification: match[0]
      });
    }
  }

  return materials;
}

function processNotesAndFeatures(text: string, features: PDFAnalysisResult['features']): string[] {
  const notes: string[] = [];
  
  // Extract notes
  const notePatterns = [
    /NOTE:?\s*(.*?)(?:\n|$)/gi,
    /IMPORTANT:?\s*(.*?)(?:\n|$)/gi,
    /WARNING:?\s*(.*?)(?:\n|$)/gi,
    /REF:?\s*(.*?)(?:\n|$)/gi,
    /TOLERANCE:?\s*(.*?)(?:\n|$)/gi
  ];

  for (const pattern of notePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const note = match[1].trim();
      if (note && !notes.includes(note)) {
        notes.push(note);
      }
    }
  }

  // Extract features
  const featurePatterns = [
    { type: 'thread', pattern: /M\d+\s*×\s*\d+/g },
    { type: 'hole', pattern: /(?:HOLE|DRILL)\s*(?:Ø|⌀)?\s*\d+(?:\.\d+)?/gi },
    { type: 'chamfer', pattern: /(?:CHAMFER|CHMF)\s*\d+(?:\.\d+)?(?:\s*×\s*\d+°)?/gi },
    { type: 'fillet', pattern: /(?:FILLET|RAD|R)\s*\d+(?:\.\d+)?/gi }
  ];

  for (const { type, pattern } of featurePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      features.push({
        type,
        description: match[0]
      });
    }
  }

  return notes;
}

function detectUnit(text: string): string {
  if (text.includes('mm')) return 'mm';
  if (text.includes('cm')) return 'cm';
  if (text.includes('m')) return 'm';
  if (text.includes('in')) return 'in';
  return 'mm'; // Default unit
}

function detectMaterialType(text: string): string {
  const normalized = text.toLowerCase();
  if (normalized.includes('steel') || normalized.match(/aisi|sae/)) return 'Steel';
  if (normalized.includes('aluminum') || normalized.match(/al\s*\d/)) return 'Aluminum';
  if (normalized.match(/abs|pla|peek|petg|nylon/)) return 'Plastic';
  if (normalized.includes('rubber')) return 'Rubber';
  if (normalized.includes('wood')) return 'Wood';
  return 'Unknown';
}