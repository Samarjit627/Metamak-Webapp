import { LoadingManager, Mesh, Material, BufferGeometry, Box3, Vector3, LOD } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three-stdlib';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier';

// Configurable limits with progressive loading
export const MODEL_LIMITS = {
  maxVertices: 5000000, // 5 million vertices
  maxPolygons: 2000000, // 2 million polygons
  maxFileSize: {
    'obj': 100 * 1024 * 1024, // 100MB
    'stl': 300 * 1024 * 1024, // 300MB
    'dxf': 50 * 1024 * 1024,  // 50MB
    'pdf': 100 * 1024 * 1024, // 100MB
    'step': 300 * 1024 * 1024, // 300MB
    'stp': 300 * 1024 * 1024   // 300MB
  },
  chunkSize: 1024 * 1024 * 10, // 10MB chunks
  lodLevels: [1.0, 0.5, 0.25, 0.1] // LOD reduction factors
};

// Memory management
const memoryManager = {
  totalUsage: 0,
  limit: 1024 * 1024 * 1024, // 1GB
  resources: new Set<{ dispose: () => void }>(),

  track(resource: { dispose: () => void }) {
    this.resources.add(resource);
    return resource;
  },

  dispose() {
    this.resources.forEach(resource => resource.dispose());
    this.resources.clear();
    this.totalUsage = 0;
  },

  async checkMemory() {
    if ('performance' in window) {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > this.limit * 0.9) {
        // Force garbage collection if possible
        this.dispose();
        return false;
      }
    }
    return true;
  }
};

// Chunk loader for large files
async function loadInChunks(file: File, chunkSize: number, onProgress: (progress: number) => void): Promise<string> {
  const chunks: Uint8Array[] = [];
  const totalChunks = Math.ceil(file.size / chunkSize);
  let loadedChunks = 0;

  for (let start = 0; start < file.size; start += chunkSize) {
    const chunk = file.slice(start, start + chunkSize);
    const buffer = await chunk.arrayBuffer();
    chunks.push(new Uint8Array(buffer));
    loadedChunks++;
    onProgress((loadedChunks / totalChunks) * 100);
    
    // Allow UI to update between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check memory status
    if (!await memoryManager.checkMemory()) {
      throw new Error('Memory limit exceeded');
    }
  }

  const decoder = new TextDecoder();
  return chunks.map(chunk => decoder.decode(chunk)).join('');
}

// LOD generation
function generateLOD(geometry: BufferGeometry): LOD {
  const lod = new LOD();
  const modifier = new SimplifyModifier();
  
  MODEL_LIMITS.lodLevels.forEach((level, index) => {
    if (index === 0) {
      // Original geometry
      lod.addLevel(new Mesh(geometry), 0);
    } else {
      // Simplified geometry
      const simplified = modifier.modify(geometry, Math.floor(geometry.attributes.position.count * level));
      lod.addLevel(new Mesh(simplified), index * 50);
      memoryManager.track(simplified);
    }
  });
  
  return lod;
}

export async function loadModel(
  file: File,
  type: 'obj' | 'stl',
  onProgress: (progress: number) => void
): Promise<{ geometries: BufferGeometry[], materials: Material[], lods: LOD[] }> {
  if (file.size > MODEL_LIMITS.maxFileSize[type]) {
    throw new Error(`File size exceeds limit of ${MODEL_LIMITS.maxFileSize[type] / (1024 * 1024)}MB`);
  }

  try {
    const geometries: BufferGeometry[] = [];
    const materials: Material[] = [];
    const lods: LOD[] = [];

    if (type === 'obj' && file.size > MODEL_LIMITS.chunkSize) {
      // Load large OBJ files in chunks
      const content = await loadInChunks(file, MODEL_LIMITS.chunkSize, onProgress);
      const loader = new OBJLoader();
      const obj = loader.parse(content);

      obj.traverse((child) => {
        if (child instanceof Mesh) {
          const lod = generateLOD(child.geometry);
          lods.push(lod);
          geometries.push(child.geometry);
          if (Array.isArray(child.material)) {
            materials.push(...child.material);
          } else {
            materials.push(child.material);
          }
        }
      });
    } else {
      // Regular loading for smaller files
      const url = URL.createObjectURL(file);
      try {
        const manager = new LoadingManager();
        manager.onProgress = (url, loaded, total) => {
          onProgress((loaded / total) * 100);
        };

        if (type === 'obj') {
          const loader = new OBJLoader(manager);
          const obj = await loader.loadAsync(url);
          
          obj.traverse((child) => {
            if (child instanceof Mesh) {
              const lod = generateLOD(child.geometry);
              lods.push(lod);
              geometries.push(child.geometry);
              if (Array.isArray(child.material)) {
                materials.push(...child.material);
              } else {
                materials.push(child.material);
              }
            }
          });
        } else {
          const loader = new STLLoader(manager);
          const geometry = await loader.loadAsync(url);
          const lod = generateLOD(geometry);
          lods.push(lod);
          geometries.push(geometry);
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    // Track resources for cleanup
    geometries.forEach(g => memoryManager.track(g));
    materials.forEach(m => memoryManager.track(m));
    lods.forEach(l => memoryManager.track(l));

    return { geometries, materials, lods };
  } catch (error) {
    memoryManager.dispose();
    throw error;
  }
}

export function disposeResources() {
  memoryManager.dispose();
}