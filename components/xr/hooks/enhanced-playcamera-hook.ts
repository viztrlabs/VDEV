// Enhanced PlayCamera Hook with WebXR Integration
// Build upon existing usePlayCameraEngine.ts with advanced WebXR capabilities

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayCameraEngine } from './usePlayCameraEngine';
import { webxrService, XRDeviceCapabilities, WebXREnvironment } from './webxr-service';

export interface EnhancedPlayCameraState {
  // Core PlayCamera state (from original usePlayCameraEngine)
  app: any;
  scene: any;
  camera: any;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // WebXR-specific state
  isXRAvailable: boolean;
  xrMode: 'none' | 'vr' | 'ar';
  deviceCapabilities: XRDeviceCapabilities;
  sessionStatus: {
    isActive: boolean;
    mode: 'vr' | 'ar' | 'none';
  };
  
  // Enhanced rendering state
  targetFov: number;
  fieldOfView: number;
  enableAdvancedLighting: boolean;
  enablePostProcessing: boolean;
}

export interface EnhancedPlayCameraResult {
  // Original PlayCamera exports
  playCanvasApp: any;
  scene: any;
  camera: any;
  isInitialized: boolean;
  error: string | null;
  
  // Enhanced WebXR exports
  initializeWebXR: (mode: 'immersive-vr' | 'immersive-ar') => Promise<WebXREnvironment>;
  endWebXRSession: () => Promise<boolean>;
  updateDeviceCapabilities: (capabilities: Partial<XRDeviceCapabilities>) => void;
  
  // Enhanced control functions
  toggleAdvancedLighting: () => void;
  togglePostProcessing: () => void;
  adjustFieldOfView: (delta: number) => void;
  setTargetFov: (fov: number) => void;
  
  // State management
  state: EnhancedPlayCameraState;
  setState: React.Dispatch<React.SetStateAction<EnhancedPlayCameraState>>;
}

export function useEnhancedPlayCameraEngine(
  canvasRef: React.RefObject<HTMLCanvasElement>
): EnhancedPlayCameraResult {
  // Initialize with original PlayCamera engine
  const originalResult = usePlayCameraEngine(canvasRef);
  const [state, setState] = useState<EnhancedPlayCameraState>({
    // Core PlayCamera state
    app: originalResult.playCanvasApp,
    scene: originalResult.scene,
    camera: originalResult.camera,
    isInitialized: originalResult.isInitialized,
    isLoading: false,
    error: null,
    
    // WebXR state
    isXRAvailable: false,
    xrMode: 'none',
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
    },
    sessionStatus: {
      isActive: false,
      mode: 'none'
    },
    
    // Enhanced rendering settings
    targetFov: 1.4,
    fieldOfView: 1.4,
    enableAdvancedLighting: true,
    enablePostProcessing: true
  });

  // WebXR initialization function
  const initializeWebXR = useCallback(async (
    mode: 'immersive-vr' | 'immersive-ar'
  ): Promise<WebXREnvironment> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Initialize WebXR session
      const xrEnvironment = await webxrService.initializeWebXR(mode);
      
      if (xrEnvironment.success) {
        // Update state with WebXR information
        setState(prev => ({
          ...prev,
          isXRAvailable: true,
          xrMode: mode === 'immersive-vr' ? 'vr' : 'ar',
          deviceCapabilities: xrEnvironment.deviceCapabilities,
          sessionStatus: {
            isActive: true,
            mode: mode === 'immersive-vr' ? 'vr' : 'ar'
          }
        }));
        
        // Adjust field of view based on device capabilities
        const adjustedFov = webxrService.calculateOptimalFOV(
          xrEnvironment.deviceCapabilities
        );
        setState(prev => ({ ...prev, fieldOfView: adjustedFov }));
      } else {
        setState(prev => ({
          ...prev,
          error: xrEnvironment.error || 'WebXR initialization failed'
        }));
      }
      
      return xrEnvironment;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // End WebXR session
  const endWebXRSession = useCallback(async (): Promise<boolean> => {
    try {
      const success = await webxrService.endWebXRSession();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isXRAvailable: false,
          xrMode: 'none',
          sessionStatus: {
            isActive: false,
            mode: 'none'
          }
        }));
      }
      
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end WebXR session'
      }));
      return false;
    }
  }, []);

  // Update device capabilities
  const updateDeviceCapabilities = useCallback((capabilities: Partial<XRDeviceCapabilities>) => {
    webxrService.updateDeviceCapabilities(capabilities);
    setState(prev => ({
      ...prev,
      deviceCapabilities: { ...prev.deviceCapabilities, ...capabilities }
    }));
  }, []);

  // Enhanced lighting control
  const toggleAdvancedLighting = useCallback(() => {
    setState(prev => ({
      ...prev,
      enableAdvancedLighting: !prev.enableAdvancedLighting
    }));

    // Apply lighting changes to scene if available
    if (state.scene) {
      // Implement advanced lighting adjustments
      console.log('Advanced lighting toggled:', !state.enableAdvancedLighting);
    }
  }, [state.scene]);

  // Post-processing control
  const togglePostProcessing = useCallback(() => {
    setState(prev => ({
      ...prev,
      enablePostProcessing: !prev.enablePostProcessing
    }));

    // Apply post-processing changes to scene
    if (state.scene) {
      console.log('Post-processing toggled:', !state.enablePostProcessing);
    }
  }, [state.scene]);

  // Field of view adjustment
  const adjustFieldOfView = useCallback((delta: number) => {
    setState(prev => {
      const newFov = Math.max(0.8, Math.min(2.0, prev.fieldOfView + delta));
      return {
        ...prev,
        fieldOfView: newFov,
        targetFov: newFov
      };
    });
  }, []);

  // Set target field of view
  const setTargetFov = useCallback((fov: number) => {
    const clampedFov = Math.max(0.8, Math.min(2.0, fov));
    setState(prev => ({
      ...prev,
      targetFov: clampedFov,
      fieldOfView: clampedFov
    }));
  }, []);

  // WebXR event listeners setup
  useEffect(() => {
    // Monitor WebXR service state changes
    const checkWebXRStatus = () => {
      const status = webxrService.getSessionStatus();
      setState(prev => ({
        ...prev,
        sessionStatus: {
          isActive: status.isActive,
          mode: status.mode
        },
        deviceCapabilities: status.deviceCapabilities
      }));
    };

    // Setup periodic status checks
    const interval = setInterval(checkWebXRStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate optimal FOV based on device capabilities
  const calculateOptimalFOV = (capabilities: XRDeviceCapabilities): number => {
    let optimalFov = 1.4; // Default FOV

    // Adjust based on hand tracking
    if (capabilities.supportsHandTracking) {
      optimalFov = Math.min(optimalFov, 1.2);
    }

    // Adjust based on depth sensing
    if (capabilities.supportsDepthSensing) {
      optimalFov = Math.max(optimalFov, 1.8);
    }

    // Adjust based on recommended FOV
    optimalFov = Math.max(optimalFov, capabilities.recommendedFov);

    return Math.min(optimalFov, capabilities.maxFoveation);
  };

  // Return enhanced PlayCamera result
  return {
    // Original PlayCamera exports
    playCanvasApp: originalResult.playCanvasApp,
    scene: originalResult.scene,
    camera: originalResult.camera,
    isInitialized: originalResult.isInitialized,
    error: originalResult.error,

    // Enhanced WebXR exports
    initializeWebXR,
    endWebXRSession,
    updateDeviceCapabilities,

    // Enhanced control functions
    toggleAdvancedLighting,
    togglePostProcessing,
    adjustFieldOfView,
    setTargetFov,

    // State management
    state,
    setState
  };
}

// Export hook
export default useEnhancedPlayCameraEngine;