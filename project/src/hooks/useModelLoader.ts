import { useState, useCallback, useEffect } from 'react';
import { BufferGeometry, Material } from 'three';
import { loadModel, disposeResources } from '../utils/modelLoader';

export function useModelLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<{
    geometries: BufferGeometry[];
    materials: Material[];
  } | null>(null);

  const loadFile = useCallback(async (file: File, type: 'obj' | 'stl') => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const data = await loadModel(file, type, setProgress);
      setModelData(data);
    } catch (err) {
      console.error('Error loading model:', err);
      setError(err instanceof Error ? err.message : 'Failed to load model');
      setModelData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      disposeResources();
    };
  }, []);

  return {
    loading,
    progress,
    error,
    modelData,
    loadFile
  };
}