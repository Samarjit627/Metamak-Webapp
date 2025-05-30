/// <reference types="vite/client" />

declare module 'pdfjs-dist' {
  const GlobalWorkerOptions: {
    workerSrc: string;
  };
  
  interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }
  
  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  
  interface PDFPageProxy {
    getTextContent(): Promise<PDFPageTextContent>;
  }
  
  interface PDFPageTextContent {
    items: Array<{
      str: string;
      [key: string]: any;
    }>;
  }
  
  function getDocument(source: {
    data: ArrayBuffer;
    cMapUrl?: string;
    cMapPacked?: boolean;
  }): PDFDocumentLoadingTask;
  
  const version: string;
  
  export { GlobalWorkerOptions, getDocument, version };
}

declare module 'react-pdf' {
  export const Document: any;
  export const Page: any;
  export const pdfjs: any;
}

declare module 'tesseract.js' {
  export interface Worker {
    loadLanguage(lang: string): Promise<void>;
    initialize(lang: string): Promise<void>;
    setParameters(params: any): Promise<void>;
    recognize(image: HTMLCanvasElement): Promise<any>;
    terminate(): Promise<void>;
  }

  export function createWorker(options?: any): Promise<Worker>;
}