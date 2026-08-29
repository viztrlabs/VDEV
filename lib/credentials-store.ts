'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CredentialField {
  key: string; // env var name, e.g. GEMINI_API_KEY
  label: string; // human label
  description: string;
  placeholder: string;
  value: string;
  updatedAt?: string;
}

interface CredentialsState {
  credentials: CredentialField[];
  setCredential: (key: string, value: string) => void;
  getCredential: (key: string) => string;
  resetCredential: (key: string) => void;
}

const DEFAULT_CREDENTIALS: CredentialField[] = [
  {
    key: 'GEMINI_API_KEY',
    label: 'Google Gemini API Key',
    description: 'Powers the Hermes AI assistant (live LLM chat).',
    placeholder: 'Paste Gemini API key (AIza... or AQ....)',
    value: '',
  },
  {
    key: 'GOOGLE_API_KEY',
    label: 'Google API Key (fallback)',
    description: 'Alternate Google key used if GEMINI_API_KEY is empty.',
    placeholder: 'Paste Google API key',
    value: '',
  },
  {
    key: 'OPENAI_API_KEY',
    label: 'OpenAI API Key',
    description: 'Optional — for future GPT-based generation features.',
    placeholder: 'sk-...',
    value: '',
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    label: 'Google OAuth Client ID',
    description: 'Enables live Google Meet / Drive integration.',
    placeholder: 'xxxx.apps.googleusercontent.com',
    value: '',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    label: 'Google OAuth Client Secret',
    description: 'Paired with the OAuth Client ID above.',
    placeholder: 'GOCSPX-...',
    value: '',
  },
  {
    key: 'STREAM_CONTROLLER_URL',
    label: 'GPU Stream Controller URL',
    description: 'URL of the GPU-PC stream controller sidecar (Phase 2F).',
    placeholder: 'http://gpu-pc-ip:3001',
    value: '',
  },
  {
    key: 'PS_TURN_URL',
    label: 'TURN Server URL',
    description: 'NAT traversal for Pixel Streaming WebRTC.',
    placeholder: 'turn:turn.viztr.io:3478',
    value: '',
  },
  {
    key: 'PS_TURN_USER',
    label: 'TURN Username',
    description: 'TURN server auth username.',

    placeholder: 'viztr',
    value: '',
  },
  {
    key: 'PS_TURN_PASS',
    label: 'TURN Password',
    description: 'TURN server auth password.',
    placeholder: '••••••••',
    value: '',
  },
];

export const useCredentialsStore = create<CredentialsState>()(
  persist(
    (set, get) => ({
      credentials: DEFAULT_CREDENTIALS,
      setCredential: (key, value) =>
        set((state) => ({
          credentials: state.credentials.map((c) =>
            c.key === key ? { ...c, value, updatedAt: new Date().toISOString() } : c
          ),
        })),
      getCredential: (key) => get().credentials.find((c) => c.key === key)?.value || '',
      resetCredential: (key) =>
        set((state) => ({
          credentials: state.credentials.map((c) =>
            c.key === key ? { ...c, value: '', updatedAt: undefined } : c
          ),
        })),
    }),
    { name: 'viztr-credentials' }
  )
);

// Mask a secret for display (show last 4 chars)
export function maskSecret(value: string): string {
  if (!value) return '';
  if (value.length <= 6) return '••••';
  return '••••' + value.slice(-4);
}
