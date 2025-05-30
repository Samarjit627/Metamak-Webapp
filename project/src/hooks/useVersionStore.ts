import { create } from 'zustand';
import { Mesh } from 'three';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';

// Initialize debug logger
const logger = debug('app:versionStore');

export interface Version {
  id: string;
  tag: string;
  mesh: Mesh;
  timestamp: Date;
  isActive: boolean;
}

interface VersionStoreState {
  versions: Version[];
  activeVersion: Version | null;
  add: (tag: string, mesh: Mesh) => Version;
  setActive: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  getById: (id: string) => Version | undefined;
}

export const useVersionStore = create<VersionStoreState>((set, get) => ({
  versions: [],
  activeVersion: null,
  
  add: (tag, mesh) => {
    logger('Adding new version:', tag);
    
    const newVersion: Version = {
      id: uuidv4(),
      tag,
      mesh,
      timestamp: new Date(),
      isActive: false
    };
    
    set(state => {
      // If this is the first version, make it active
      if (state.versions.length === 0) {
        newVersion.isActive = true;
        return {
          versions: [newVersion],
          activeVersion: newVersion
        };
      }
      
      return {
        versions: [...state.versions, newVersion]
      };
    });
    
    logger('Version added successfully:', newVersion.id);
    return newVersion;
  },
  
  setActive: (id) => {
    logger('Setting active version:', id);
    
    set(state => {
      const updatedVersions = state.versions.map(version => ({
        ...version,
        isActive: version.id === id
      }));
      
      const activeVersion = updatedVersions.find(v => v.id === id) || null;
      
      return {
        versions: updatedVersions,
        activeVersion
      };
    });
  },
  
  remove: (id) => {
    logger('Removing version:', id);
    
    set(state => {
      const updatedVersions = state.versions.filter(v => v.id !== id);
      
      // If we removed the active version, set the first available version as active
      let activeVersion = state.activeVersion;
      if (state.activeVersion?.id === id) {
        activeVersion = updatedVersions.length > 0 ? updatedVersions[0] : null;
        if (activeVersion) {
          activeVersion.isActive = true;
        }
      }
      
      return {
        versions: updatedVersions,
        activeVersion
      };
    });
  },
  
  clear: () => {
    logger('Clearing all versions');
    
    set({
      versions: [],
      activeVersion: null
    });
  },
  
  getById: (id) => {
    return get().versions.find(v => v.id === id);
  }
}));