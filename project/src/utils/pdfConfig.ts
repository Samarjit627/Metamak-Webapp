import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Initialize PDF.js
export const initPDFJS = async () => {
  try {
    await pdfjsLib.getDocument({ data: new Uint8Array(0) }).promise.catch(() => {});
    console.log('PDF.js initialized successfully');
  } catch (error) {
    console.error('Failed to initialize PDF.js:', error);
  }
};

// Export configured pdfjsLib
export { pdfjsLib };