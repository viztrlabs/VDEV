import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  Auth,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase safely
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Configure Google Auth Provider with Google Drive Scopes
export const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive');
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
googleDriveProvider.setCustomParameters({
  prompt: 'select_account',
});

// Configure Google Auth Provider with Google Meet Scopes
export const googleMeetProvider = new GoogleAuthProvider();
googleMeetProvider.addScope('https://www.googleapis.com/auth/meetings.space.created');
googleMeetProvider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
googleMeetProvider.addScope('https://www.googleapis.com/auth/meetings.space.settings');
googleMeetProvider.setCustomParameters({
  prompt: 'select_account',
});

// Combined Google Workspace Provider (Drive + Meet)
export const googleWorkspaceProvider = new GoogleAuthProvider();
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/meetings.space.created');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/meetings.space.settings');
googleWorkspaceProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cache tokens in memory
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface ConnectedDriveAccount {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  accessToken: string;
  connectedAt: string;
  scopeLevel: 'Full Drive' | 'Selected Files' | 'Read Only';
  isPrimary?: boolean;
  assignedProjects?: string[];
  totalStorageUsed?: string;
  storageQuota?: string;
  accountRole?: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT';
}

export interface ConnectedMeetAccount {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  accessToken: string;
  connectedAt: string;
  scopeLevel: 'Meeting Host' | 'Meeting Participant' | 'Full Meet';
  isPrimary?: boolean;
  assignedProjects?: string[];
  defaultAccessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  accountRole?: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT';
  activeRoomCount?: number;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Connects a Google account with Google Drive permissions
 */
export const connectGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleDriveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Connects a Google account with Google Meet permissions
 */
export const connectGoogleMeet = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleMeetProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Meet OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Meet sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Connects combined Google Workspace account (Drive + Meet)
 */
export const connectGoogleWorkspace = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleWorkspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Workspace OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Workspace sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const disconnectGoogleDrive = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (e) {
    console.error('Sign out error:', e);
  }
};
