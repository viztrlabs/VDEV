// WebXR type definitions for VizTR platform

export interface XRSession {
  updateRenderState(renderState: XRRenderState): void;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  end(): Promise<void>;
  modes: XRSessionMode[];
  visibilityState: XRVisibilityState;
}

export interface XRRenderState {
  baseLayer?: XRWebGLLayer;
  inlineVerticalFieldOfView?: number;
  depthNear?: number;
  depthFar?: number;
}

export interface XRFrameRequestCallback {
  (time: number, frame: XRFrame): void;
}

export interface XRFrame {
  session: XRSession;
  predictedDisplayTime: number;
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
  getPose(space: XRSpace, baseSpace: XRReferenceSpace): XRSpace | null;
}

export interface XRViewerPose {
  transform: XRTransform;
  viewers: XRViewerPose[];
  angularVelocity: DOMPointReadOnly;
  linearVelocity: DOMPointReadOnly;
}

export type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
export type XRVisibilityState = 'visible' | 'hidden' | 'visible-blur';

// Extend Navigator for WebXR
declare global {
  interface Navigator {
    xr?: {
      isSessionSupported(mode: string): Promise<boolean>;
      requestSession(mode: string, init?: any): Promise<XRSession>;
    };
  }
}
