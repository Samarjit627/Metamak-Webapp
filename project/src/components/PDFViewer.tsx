import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { pdfjsLib, initPDFJS } from '../utils/pdfConfig';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:pdfViewer');

interface PDFViewerProps {
  file: File;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    initPDFJS();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        logger('Loading PDF file');

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });
        
        const pdfDoc = await loadingTask.promise;
        
        if (!mounted) return;
        
        pdfDocRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);
        
        // Get the first page
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0, rotation: 0 });

        // Calculate scale to fit the page width
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 64;
          const initialScale = containerWidth / viewport.width;
          setScale(initialScale);

          // Render with the calculated scale
          await renderPage(pdfDoc, 1, 0, initialScale);
        }

        logger('PDF loaded successfully');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        logger('Error loading PDF:', errorMsg);
        setError('Failed to load PDF. Please try again.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      mounted = false;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [file]);

  const renderPage = async (
    pdfDoc: pdfjsLib.PDFDocumentProxy, 
    pageNum: number, 
    rot: number,
    zoom: number
  ) => {
    try {
      if (!canvasRef.current) return;

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom, rotation: rot });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        enableWebGL: true,
        renderInteractiveForms: true
      };

      await page.render(renderContext).promise;
      logger('Page rendered successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      logger('Error rendering page:', errorMsg);
      setError('Failed to render PDF page');
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage, rotation, scale);
    }
  }, [currentPage, rotation, scale]);

  const handlePageChange = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
              title="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === numPages}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
              title="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <button
            onClick={handleRotate}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Rotate"
          >
            <RotateCw size={20} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* PDF Content */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-100"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-600">Loading PDF...</p>
            </div>
          </div>
        ) : (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
          >
            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full flex items-center justify-center p-8"
            >
              <canvas 
                ref={canvasRef}
                className="shadow-xl rounded-lg bg-white"
              />
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
    </div>
  );
};