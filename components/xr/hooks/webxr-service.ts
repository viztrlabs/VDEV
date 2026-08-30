// WebXR Service Implementation
// Comprehensive WebXR integration with device detection, session management, and VR/AR support

export interface XRDeviceCapabilities {
  hasWebXR: boolean;
  hasVR: boolean;
  hasAR: boolean;
  supportsHandTracking: boolean;
  supportsPlaneDetection: boolean;
  supportsAnchorSystem: boolean;
  maxFoveation: number;
  recommendedFov: number;
  supportsDepthSensing: boolean;
}

export interface WebXREnvironment {
  success: boolean;
  session?: XRSession;
  referenceSpace?: XRReferenceSpace;
  deviceCapabilities: XRDeviceCapabilities;
  error?: string;
  available?: XRDeviceCapabilities;
}

export interface SessionStatus {
  isActive: boolean;
  mode: 'vr' | 'ar' | 'none';
  deviceCapabilities: XRDeviceCapabilities;
}

export class WebXRService {
  private xrSession: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private availableDevices: XRDeviceCapabilities;

  constructor() {
    this.availableDevices = {
      hasWebXR: false,
      hasVR: false,
      hasAR: false,
      supportsHandTracking: false,
      supportsPlaneDetection: false,
      supportsAnchorSystem: false,
      maxFoveation: 1.0,
      recommendedFov: 1.4,
      supportsDepthSensing: false
    };
  }

  // WebXR support detection
  private checkWebXRSupport(): boolean {
    return typeof navigator !== 'undefined' &&
           'xr' in navigator &&
           navigator.xr !== undefined;
  }

  // Initialize WebXR session with comprehensive error handling
  public async initializeWebXR(mode: 'immersive-vr' | 'immersive-ar'): Promise<WebXREnvironment> {
    try {
      const xr = navigator.xr;
      if (!xr) {
        return {
          success: false,
          error: 'WebXR not supported in this browser',
          deviceCapabilities: this.availableDevices,
          available: this.availableDevices,
        };
      }

      // Request session based on mode
      this.xrSession = await xr.requestSession(mode);
      return await this.setupSession(mode === 'immersive-vr' ? 'vr' : 'ar');
    } catch (vrError) {
      // Fallback to AR if VR fails
      try {
        const xr = navigator.xr;
        if (!xr) throw new Error('WebXR not supported');
        this.xrSession = await xr.requestSession('immersive-ar');
        return await this.setupSession('ar');
      } catch (arError) {
        return {
          success: false,
          error: `VR and AR both failed: ${arError instanceof Error ? arError.message : String(arError)}`,
          deviceCapabilities: this.availableDevices,
          available: this.availableDevices,
        };
      }
    }
  }

  // Setup WebXR session with reference space and capabilities
  private async setupSession(mode: 'vr' | 'ar'): Promise<WebXREnvironment> {
    if (!this.xrSession) {
      throw new Error('XR session not available for setup');
    }

    // Create appropriate reference space based on mode
    this.referenceSpace = await this.xrSession.requestReferenceSpace(
      mode === 'vr' ? 'local-floor' : 'local'
    );

    // Detect comprehensive device capabilities
    await this.detectDeviceCapabilities();

    // Setup input sources
    await this.setupInputSources();

    return {
      success: true,
      session: this.xrSession,
      referenceSpace: this.referenceSpace,
      deviceCapabilities: this.availableDevices
    };
  }

  // Comprehensive device capability detection
  private async detectDeviceCapabilities(): Promise<XRDeviceCapabilities> {
    if (!this.xrSession) {
      throw new Error('XR session not available for capability detection');
    }

    const capabilities: XRDeviceCapabilities = {
      hasWebXR: true,
      hasVR: false,
      hasAR: false,
      supportsHandTracking: false,
      supportsPlaneDetection: false,
      supportsAnchorSystem: false,
      maxFoveation: 1.0,
      recommendedFov: 1.4,
      supportsDepthSensing: false
    };

    // Check for VR support
    try {
      const vrSupported = (await navigator.xr?.isSessionSupported('immersive-vr')) ?? false;
      capabilities.hasVR = vrSupported;
    } catch {
      capabilities.hasVR = false;
    }

    // Check for AR support
    try {
      const arSupported = (await navigator.xr?.isSessionSupported('immersive-ar')) ?? false;
      capabilities.hasAR = arSupported;
    } catch {
      capabilities.hasAR = false;
    }

    // Check for hand tracking support
    try {
      const inputSources = Array.from(this.xrSession.inputSources);
      capabilities.supportsHandTracking = inputSources.some(
        (source: XRInputSource) => source.hand !== undefined || (source as any).grip !== undefined
      );
    } catch {
      capabilities.supportsHandTracking = false;
    }

    // Check for plane detection (AR-specific)
    if (capabilities.supportsHandTracking) {
      try {
        await (this.xrSession as any).requestReferenceSpace('hit-test');
        capabilities.supportsPlaneDetection = true;
      } catch {
        capabilities.supportsPlaneDetection = false;
      }
    }

    // Check for anchor system (AR-specific)
    if (capabilities.supportsPlaneDetection) {
      try {
        await (this.xrSession as any).requestReferenceSpace('anchor-system');
        capabilities.supportsAnchorSystem = true;
      } catch {
        capabilities.supportsAnchorSystem = false;
      }
    }

    // Check for depth sensing capabilities
    try {
      const supportedFeatures = (this.xrSession as any).getSupportedFeatures?.();
      if (supportedFeatures) {
        capabilities.supportsDepthSensing = !!(
          typeof supportedFeatures.has === 'function'
            ? supportedFeatures.has('depth-sensing')
            : Array.isArray(supportedFeatures) && supportedFeatures.includes('depth-sensing')
        );
      }
    } catch {
      capabilities.supportsDepthSensing = false;
    }

    return capabilities;
  }

  // Setup and initialize input sources
  private async setupInputSources(): Promise<void> {
    if (!this.xrSession) return;

    this.xrSession.inputSources.forEach((source) => {
      console.log(`Input source detected: ${source.targetRayMode}, hand: ${source.hand}, grip: ${(source as any).grip}`);
    });
  }

  // Get current WebXR session status
  public getSessionStatus(): SessionStatus {
    return {
      isActive: this.xrSession !== null,
      mode: this.xrSession ? this.getSessionMode() : 'none',
      deviceCapabilities: this.availableDevices
    };
  }

  // Determine current session mode
  private getSessionMode(): 'vr' | 'ar' | 'none' {
    if (!this.xrSession) return 'none';

    // Determine session type based on capabilities
    if (this.availableDevices.hasAR) {
      return 'ar';
    } else if (this.availableDevices.hasVR) {
      return 'vr';
    }

    return 'none';
  }

  // Terminate WebXR session
  public async endWebXRSession(): Promise<boolean> {
    if (this.xrSession) {
      this.xrSession.end();
      this.xrSession = null;
      this.referenceSpace = null;
      return true;
    }
    return false;
  }

  // Check if WebXR is currently active
  public isWebXRActive(): boolean {
    return this.xrSession !== null;
  }

  // Get current reference space
  public getReferenceSpace(): XRReferenceSpace | null {
    return this.referenceSpace;
  }

  // Get available device capabilities
  public getDeviceCapabilities(): XRDeviceCapabilities {
    return { ...this.availableDevices };
  }

  // Update device capabilities (for runtime updates)
  public updateDeviceCapabilities(capabilities: Partial<XRDeviceCapabilities>): void {
    this.availableDevices = { ...this.availableDevices, ...capabilities };
  }
}

// Export singleton instance
export const webxrService = new WebXRService();

// Utility functions for WebXR integration
export class WebXRUtils {

  // Check if current device supports WebXR
  static async isDeviceWebXRCapable(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('xr' in navigator)) {
      return false;
    }

    try {
      const xr = navigator.xr;
      if (!xr) return false;
      const vrSupported = await xr.isSessionSupported('immersive-vr');
      const arSupported = await xr.isSessionSupported('immersive-ar');
      return vrSupported || arSupported;
    } catch {
      return false;
    }
  }

  // Get device type classification
  static async getDeviceType(): Promise<'desktop' | 'mobile' | 'unknown'> {
    if (typeof navigator === 'undefined') {
      return 'unknown';
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|tablet|iphone|ipad|android/.test(userAgent);
    const isDesktop = !isMobile && /windows|macintosh|linux/.test(userAgent);

    if (isMobile) {
      return 'mobile';
    } else if (isDesktop) {
      return 'desktop';
    }

    return 'unknown';
  }

  // Calculate field of view adjustment based on device capabilities
  static calculateFOV(capabilities: XRDeviceCapabilities, baseFov: number = 1.4): number {
    let adjustedFov = baseFov;

    // Adjust for hand tracking limitations
    if (capabilities.supportsHandTracking) {
      adjustedFov = Math.min(adjustedFov, 1.2);
    }

    // Adjust for depth sensing capabilities
    if (capabilities.supportsDepthSensing) {
      adjustedFov = Math.max(adjustedFov, 1.8);
    }

    return adjustedFov;
  }

  // Generate WebXR session configuration
  static generateSessionConfig(mode: 'vr' | 'ar', capabilities: XRDeviceCapabilities): any {
    const config: any = {
      requiredFeatures: [],
      optionalFeatures: []
    };

    // Add WebXR features based on device capabilities
    if (capabilities.supportsHandTracking) {
      config.optionalFeatures.push('hand-tracking');
    }

    if (capabilities.supportsPlaneDetection) {
      config.optionalFeatures.push('plane-detection');
    }

    if (capabilities.supportsAnchorSystem) {
      config.optionalFeatures.push('anchors');
    }

    if (capabilities.supportsDepthSensing) {
      config.optionalFeatures.push('depth-sensing');
    }

    // Mode-specific configuration
    if (mode === 'vr') {
      config.requiredFeatures.push('viewer', 'local-floor');
    } else {
      config.requiredFeatures.push('hit-test', 'local-floor');
    }

    return config;
  }
}

// Type definitions for WebXR event handling
export interface WebXREvents {
  onSessionStart?: (session: XRSession) => void;
  onSessionEnd?: () => void;
  onInputSourceChange?: (sources: XRInputSource[]) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

// WebXR event manager
export class WebXREventManager {
  private static instance: WebXREventManager;
  private events: WebXREvents = {};

  static getInstance(): WebXREventManager {
    if (!WebXREventManager.instance) {
      WebXREventManager.instance = new WebXREventManager();
    }
    return WebXREventManager.instance;
  }

  public setEvents(events: WebXREvents): void {
    this.events = { ...this.events, ...events };
  }

  public setupEventListeners(session: XRSession): void {
    if (this.events.onSessionStart) {
      session.addEventListener('start', () => {
        this.events.onSessionStart?.(session);
      });
    }

    if (this.events.onSessionEnd) {
      session.addEventListener('end', () => {
        this.events.onSessionEnd?.();
      });
    }

    if (this.events.onInputSourceChange) {
      session.addEventListener('inputsourceschange', (event: XRInputSourcesChangeEvent) => {
        this.events.onInputSourceChange?.(event.added.concat(event.removed));
      });
    }

    if (this.events.onVisibilityChange) {
      session.addEventListener('visibilitystatechange', (event: any) => {
        const target = event.target as XRSession;
        this.events.onVisibilityChange?.(!!(target as any).isPrimary && event.state === 'visible');
      });
    }
  }
}