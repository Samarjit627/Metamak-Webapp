import Tesseract from 'tesseract.js';
import { openai } from './callGPT';
import * as pdfjsLib from 'pdfjs-dist';
import { parseDimensionsFromOCRText } from './parsers/parseDimensionsFromOCRText';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:pdfDrawingAnalyzer');

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

async function convertPdfPageToImage(pdfUrl: string): Promise<HTMLCanvasElement> {
  try {
    logger('Converting PDF page to image');
    
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get canvas context');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    logger('PDF page converted to canvas successfully');
    return canvas;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error converting PDF to canvas:', errorMsg);
    throw new Error(`Failed to convert PDF to canvas: ${errorMsg}`);
  }
}

export async function analyzeEngineeringDrawingPDFWithOCR(fileUrl: string): Promise<{ 
  analysisSummary: string;
  metadata: {
    dimensions?: string[];
    material?: string;
    tolerance?: string;
    notes?: string[];
  };
}> {
  try {
    logger('Starting OCR analysis of engineering drawing');

    const canvas = await convertPdfPageToImage(fileUrl);
    const worker = await Tesseract.createWorker();

    try {
      worker.logger = (m: any) => {
        logger('Tesseract progress:', m);
      };

      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-+()[]',
        tessedit_pageseg_mode: '1',
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0'
      });
      
      logger('Attempting OCR text extraction');
      const { data } = await worker.recognize(canvas);
      await worker.terminate();

      if (!data.text || data.text.trim().length === 0) {
        return {
          analysisSummary: '⚠️ No readable text was found in the drawing. Please ensure the PDF contains visible text or annotations.',
          metadata: {}
        };
      }

      logger('OCR text extraction completed. Extracted text:', data.text);

      // Parse dimensions and other metadata
      const metadata = parseDimensionsFromOCRText(data.text);

      // Construct GPT prompt
      const prompt = `You are analyzing an engineering drawing. Here's the extracted text and metadata:

Text:
"""
${data.text}
"""

Parsed Metadata:
- Dimensions: ${metadata.dimensions.join(', ')}
${metadata.material ? `- Material: ${metadata.material}` : ''}
${metadata.tolerance ? `- Tolerance: ${metadata.tolerance}` : ''}
${metadata.notes?.length ? `- Notes: ${metadata.notes.join(', ')}` : ''}

Please provide a brief analysis (2-3 sentences) focusing on key features and manufacturing considerations. Then, ask the user about the part's functionality and intended use to provide better recommendations.`;

      logger('Sending text to GPT for analysis');

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const analysisSummary = response.choices[0].message.content || 'No analysis generated';
      
      logger('Analysis completed successfully');

      return {
        analysisSummary,
        metadata
      };

    } finally {
      await worker.terminate();
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error analyzing PDF drawing:', errorMsg);
    
    let userFriendlyMessage = '⚠️ Failed to analyze the drawing.\n\n';
    
    if (errorMsg.includes('Failed to load PDF')) {
      userFriendlyMessage += 'Could not load the PDF file. Please ensure it is a valid engineering drawing.';
    } else if (errorMsg.includes('canvas')) {
      userFriendlyMessage += 'Failed to process the drawing. Please try uploading a clearer PDF.';
    } else if (errorMsg.includes('OCR')) {
      userFriendlyMessage += 'Could not read text from the drawing. Please ensure the text is clear and not handwritten.';
    } else {
      userFriendlyMessage += `An unexpected error occurred: ${errorMsg}\n\nPlease try again with a different file.`;
    }
    
    return {
      analysisSummary: userFriendlyMessage,
      metadata: {}
    };
  }
}