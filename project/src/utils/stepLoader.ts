import { BufferGeometry } from 'three';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:stepLoader');

let wasmModule: any = null;

export async function loadSTEPFile(file: File): Promise<BufferGeometry> {
  try {
    logger('Loading STEP file:', { fileName: file.name, fileSize: file.size });

    if (!wasmModule) {
      logger('Initializing WASM module...');
      wasmModule = await import('occt-import-js');
      await wasmModule.default();
      logger('WASM module initialized successfully');
    }

    const arrayBuffer = await file.arrayBuffer();
    logger('File converted to ArrayBuffer, processing with WASM module...');

    const result = await wasmModule.loadSTEP(new Uint8Array(arrayBuffer));
    
    if (!result || !result.geometry) {
      const error = 'Failed to load STEP file: No geometry data returned';
      logger('Error:', error);
      throw new Error(error);
    }
    
    logger('STEP file processed successfully');
    return result.geometry;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    logger('Error in loadSTEPFile:', errorMsg);
    console.error('Error in loadSTEPFile:', error);
    throw new Error(`Failed to load STEP file: ${errorMsg}`);
  }
}