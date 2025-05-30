import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { useModelStore } from '../store/modelStore';
import { MODEL_LIMITS } from '../utils/modelLoader';
import { loadSTEPFile } from '../utils/stepLoader';
import debug from 'debug';

// Enable debug logging in browser
if (typeof window !== 'undefined') {
  localStorage.setItem('debug', 'app:*');
}

// Initialize debug logger
const logger = debug('app:fileUpload');

interface FileUploadProps {
  accept?: string;
  onFileSelect?: (file: File) => void;
  minimal?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  accept = '.obj,.stl,.step,.stp,.pdf',
  onFileSelect,
  minimal = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setModelFile, setFileName, setFileType } = useModelStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFileSize = (file: File): boolean => {
    logger('Validating file size:', {
      fileName: file.name,
      fileSize: file.size,
      extension: file.name.split('.').pop()?.toLowerCase()
    });

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !MODEL_LIMITS.maxFileSize[extension as keyof typeof MODEL_LIMITS.maxFileSize]) {
      // Don't show error for PDF files since they're handled separately
      if (extension === 'pdf') {
        return true;
      }
      const errorMsg = `Unsupported file extension: ${extension}`;
      logger('Validation error: %s', errorMsg);
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    const maxSize = MODEL_LIMITS.maxFileSize[extension as keyof typeof MODEL_LIMITS.maxFileSize];
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      const errorMsg = `File size exceeds the maximum limit of ${sizeMB}MB for ${extension.toUpperCase()} files`;
      logger('Validation error: %s', errorMsg);
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    logger('File size validation passed');
    setError(null);
    return true;
  };

  const handleFile = async (file: File) => {
    logger('Handling file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!validateFileSize(file)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      logger(`Processing ${extension?.toUpperCase()} file:`, file.name);
      
      if (extension === 'step' || extension === 'stp') {
        logger('Loading STEP/STP file...');
        const geometry = await loadSTEPFile(file);
        logger('STEP/STP file loaded successfully');
        setModelFile(file);
        setFileName(file.name);
        setFileType(extension as 'step' | 'stp');
      } else if (extension === 'obj' || extension === 'stl') {
        setModelFile(file);
        setFileName(file.name);
        setFileType(extension as 'obj' | 'stl');
      } else if (extension === 'pdf') {
        logger('Processing PDF file');
        if (onFileSelect) {
          onFileSelect(file);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      logger('Error processing file: %s', errorMsg);
      console.error('Error processing file:', errorMsg);
      setError(`Error loading file: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    logger('File input change event triggered');
    const file = event.target.files?.[0];
    if (file) {
      logger('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      await handleFile(file);
    } else {
      logger('No file selected');
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      logger('File dropped:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      await handleFile(file);
    }
  }, []);

  if (minimal) {
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept={accept}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FileUp size={18} />
          <span className="text-sm font-medium">Upload</span>
        </button>
      </>
    );
  }

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept={accept}
        className="hidden"
      />
      <div
        className={`flex flex-col items-center justify-center gap-4 ${
          isDragging 
            ? 'bg-blue-50 border-blue-300 shadow-lg scale-102' 
            : 'bg-white/90 backdrop-blur-sm border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
        } border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer min-h-[240px] group`}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={`rounded-full p-4 ${
          isDragging 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
          } transition-colors`}
        >
          <Upload size={32} className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`} />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Drop your file here or click to browse
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Supported formats: {accept}
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-600">Loading file...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};