// WebXR State Management - Enhanced State Management for WebXR Integration

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { XRDeviceCapabilities, SessionStatus } from './hooks/webxr-service';
import { XRScene, AnnotationItem } from './xr.types';

export interface WebXRState {
  // Session state
  session: {
    isActive: boolean;
    mode: 'none' | 'vr' | 'ar';
    deviceCapabilities: XRDeviceCapabilities;
  };
  
  // Mode management
  currentMode: 'tour' | 'vr' | 'ar';
  
  // Scene management
  scenes: XRScene[];
  currentSceneId: string;
  viewedScenes: string[];
  isTransitioning: boolean;
  
  // Annotations
  activeAnnotation: AnnotationItem | null;
  
  // Device information
  deviceInfo: {
    userAgent: string;
    isMobile: boolean;
    hasTouch: boolean;
    pixelRatio: number;
  };
  
  // Performance metrics
  performance: {
    fps: number;
    drawCalls: number;
    triangles: number;
    memoryUsage: number;
  };
  
  // User preferences
  preferences: {
    enableHaptics: boolean;
    enableHandTracking: boolean;
    enablePlaneDetection: boolean;
    enableAnchors: boolean;
    fieldOfView: number;
    advancedLighting: boolean;
    postProcessing: boolean;
  };
  
  // System status
  system: {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    lastUpdate: number;
  };
}

export interface WebXRActions {
  // Session management
  initializeSession: (mode: 'immersive-vr' | 'immersive-ar') => Promise<boolean>;
  endSession: () => Promise<boolean>;
  toggleSession: () => Promise<void>;
  
  // Mode management
  setMode: (mode: 'tour' | 'vr' | 'ar') => void;
  
  // Scene management
  setScene: (sceneId: string) => void;
  setScenes: (scenes: XRScene[]) => void;
  
  // Annotations
  showAnnotation: (hotspotId: string) => void;
  hideAnnotation: () => void;
  
  // Cinematic entry
  completeEntry: () => void;
  
  // Device capability management
  updateDeviceCapabilities: (capabilities: Partial<XRDeviceCapabilities>) => void;
  detectDeviceCapabilities: () => Promise<void>;
  
  // User preferences
  updatePreferences: (preferences: Partial<WebXRState['preferences']>) => void;
  resetPreferences: () => void;
  
  // Performance monitoring
  updatePerformanceMetrics: (metrics: Partial<WebXRState['performance']>) => void;
  
  // System status
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility functions
  reset: () => void;
  exportState: () => Partial<WebXRState>;
  importState: (state: Partial<WebXRState>) => void;
}

// Initial state
const initialState: WebXRState = {
  session: {
    isActive: false,
    mode: 'none',
    deviceCapabilities: {
      hasWebXR: false,
      hasVR: false,
      hasAR: false,
      supportsHandTracking: false,
      supportsPlaneDetection: false,
      supportsAnchorSystem: false,
      maxFoveation: 1.0,
      recommendedFov: 1.4,
      supportsDepthSensing: false
    }
  },
  currentMode: 'tour',
  scenes: [],
  currentSceneId: 'scene-01',
  viewedScenes: [],
  isTransitioning: false,
  activeAnnotation: null,
  deviceInfo: {
    userAgent: '',
    isMobile: false,
    hasTouch: false,
    pixelRatio: 1.0
  },
  performance: {
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    memoryUsage: 0
  },
  preferences: {
    enableHaptics: true,
    enableHandTracking: true,
    enablePlaneDetection: false,
    enableAnchors: false,
    fieldOfView: 1.4,
    advancedLighting: true,
    postProcessing: true
  },
  system: {
    isInitialized: false,
    isLoading: false,
    error: null,
    lastUpdate: Date.now()
  }
};

// Create WebXR store with Immer for state management
export const useWebXRStore = create<WebXRState & WebXRActions>()(
  immer((set, get) => ({
    // Initial state
    ...initialState,

    // Mode management actions
    setMode: (mode) => {
      set(state => {
        state.currentMode = mode;
        state.system.lastUpdate = Date.now();
      });
    },

    // Scene management actions
    setScene: (sceneId) => {
      set(state => {
        state.currentSceneId = sceneId;
        if (!state.viewedScenes.includes(sceneId)) {
          state.viewedScenes.push(sceneId);
        }
        state.system.lastUpdate = Date.now();
      });
    },

    setScenes: (scenes) => {
      set(state => {
        state.scenes = scenes;
        if (scenes.length > 0 && !scenes.find(s => s.id === state.currentSceneId)) {
          state.currentSceneId = scenes[0].id;
        }
        state.system.lastUpdate = Date.now();
      });
    },

    // Annotation actions
    showAnnotation: (hotspotId) => {
      set(state => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        const hotspot = scene?.hotspots.find(h => h.id === hotspotId);
        state.activeAnnotation = hotspot
          ? { id: hotspotId, hotspotId, title: hotspot.title, text: hotspot.title }
          : { id: hotspotId, hotspotId, title: '', text: '' };
        state.system.lastUpdate = Date.now();
      });
    },

    hideAnnotation: () => {
      set(state => {
        state.activeAnnotation = null;
        state.system.lastUpdate = Date.now();
      });
    },

    // Cinematic entry completion
    completeEntry: () => {
      set(state => {
        state.currentMode = 'tour';
        state.system.lastUpdate = Date.now();
      });
    },

    // Session management actions
    initializeSession: async (mode) => {
      try {
        set(state => {
          state.system.isLoading = true;
          state.system.error = null;
        });

        // Import WebXR service
        const { webxrService } = await import('./hooks/webxr-service');
        
        const success = await webxrService.initializeWebXR(mode);
        
        if (success.success) {
          set(state => {
            state.session.isActive = true;
            state.session.mode = mode === 'immersive-vr' ? 'vr' : 'ar';
            state.system.lastUpdate = Date.now();
          });
        } else {
          set(state => {
            state.system.error = success.error || 'Failed to initialize WebXR session';
          });
        }

        set(state => {
          state.system.isLoading = false;
        });

        return success.success;
      } catch (error) {
        set(state => {
          state.system.error = error instanceof Error ? error.message : 'Unknown error';
          state.system.isLoading = false;
        });
        return false;
      }
    },

    endSession: async () => {
      try {
        const { webxrService } = await import('./hooks/webxr-service');
        const success = await webxrService.endWebXRSession();

        if (success) {
          set(state => {
            state.session.isActive = false;
            state.session.mode = 'none';
            state.system.lastUpdate = Date.now();
          });
        }

        return success;
      } catch (error) {
        set(state => {
          state.system.error = error instanceof Error ? error.message : 'Failed to end WebXR session';
        });
        return false;
      }
    },

    toggleSession: async () => {
      const { session } = get();
      
      if (session.isActive) {
        await get().endSession();
      } else {
        await get().initializeSession(session.mode === 'none' ? 'immersive-vr' : 'immersive-ar');
      }
    },

    // Device capability management
    updateDeviceCapabilities: (capabilities) => {
      set(state => {
        state.session.deviceCapabilities = {
          ...state.session.deviceCapabilities,
          ...capabilities
        };
        state.system.lastUpdate = Date.now();
      });
    },

    detectDeviceCapabilities: async () => {
      try {
        const { webxrService } = await import('./hooks/webxr-service');
        const capabilities = webxrService.getDeviceCapabilities();
        
        set(state => {
          state.session.deviceCapabilities = capabilities;
          state.system.lastUpdate = Date.now();
        });
      } catch (error) {
        set(state => {
          state.system.error = error instanceof Error ? error.message : 'Failed to detect device capabilities';
        });
      }
    },

    // User preferences
    updatePreferences: (preferences) => {
      set(state => {
        state.preferences = { ...state.preferences, ...preferences };
        state.system.lastUpdate = Date.now();
      });
    },

    resetPreferences: () => {
      set(state => {
        state.preferences = { ...initialState.preferences };
        state.system.lastUpdate = Date.now();
      });
    },

    // Performance monitoring
    updatePerformanceMetrics: (metrics) => {
      set(state => {
        state.performance = { ...state.performance, ...metrics };
        state.system.lastUpdate = Date.now();
      });
    },

    // System status
    setInitialized: (initialized) => {
      set(state => {
        state.system.isInitialized = initialized;
        state.system.lastUpdate = Date.now();
      });
    },

    setLoading: (loading) => {
      set(state => {
        state.system.isLoading = loading;
        state.system.lastUpdate = Date.now();
      });
    },

    setError: (error) => {
      set(state => {
        state.system.error = error;
        state.system.lastUpdate = Date.now();
      });
    },

    // Utility functions
    reset: () => {
      set(() => ({ ...initialState }));
    },

    exportState: () => {
      return { ...get() };
    },

    importState: (state) => {
      set(() => ({
        ...initialState,
        ...state
      }));
    }
  }))
);

// Selectors for easy state access
export const useWebXRSession = () => useWebXRStore(state => state.session);
export const useWebXRDeviceInfo = () => useWebXRStore(state => state.deviceInfo);
export const useWebXRPerformance = () => useWebXRStore(state => state.performance);
export const useWebXRPrefences = () => useWebXRStore(state => state.preferences);
export const useWebXRSystem = () => useWebXRStore(state => state.system);

// Session status selector
export const useWebXRSessionStatus = () => useWebXRStore(state => state.session);

// Device capability selector
export const useWebXRDeviceCapabilities = () => useWebXRStore(state => state.session.deviceCapabilities);

// WebXR active state selector
export const useIsWebXRActive = () => useWebXRStore(state => state.session.isActive);

// WebXR mode selector
export const useWebXRMode = () => useWebXRStore(state => state.session.mode);

// Quality of service selector
export const useWebXRQoS = () => {
  const state = useWebXRStore();
  return {
    fps: state.performance.fps,
    isActive: state.session.isActive,
    mode: state.session.mode,
    isLoading: state.system.isLoading,
    error: state.system.error
  };
};

// Export store for direct access
export default useWebXRStore;

// Alias for backward compatibility — components import useXRStore
export const useXRStore = useWebXRStore;