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
    key: 'OPENROUTER_API_KEY',
    label: 'OpenRouter API Key',
    description: 'Alternate LLM provider — gives access to 100+ models (GPT-4o, Claude, Mistral, Gemini) through a single key. Used as a fallback when Gemini quota is exhausted.',
    placeholder: 'sk-or-v1-...',
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
    key: 'PLAYCANVAS_API_KEY',
    label: 'PlayCanvas API Key',
    description: 'Enables PlayCanvas Cloud API (project metadata, asset sync).',
    placeholder: 'Paste PlayCanvas API key',
    value: '',
  },
  {
    key: 'PLAYCANVAS_PROJECT_ID',
    label: 'PlayCanvas Project ID',
    description: 'The PlayCanvas project to pull metadata/assets from.',
    placeholder: 'e.g. 1234567',
    value: '',
  },
  {
    key: 'COLLAB_WS_URL',
    label: 'Collaboration WebSocket URL',
    description: 'Optional — URL of the VizTR collaboration server (scripts/collab-server.mjs).',
    placeholder: 'ws://localhost:4000',
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
    key: 'TELEGRAM_BOT_TOKEN',
    label: 'Telegram Bot Token',
    description: 'From @BotFather — activates the free Telegram connector for instant replies.',
    placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
    value: '',
  },
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API Key',
    description: 'Email delivery for booking confirmations, contact form notifications, and newsletters. Get it from https://resend.com/api-keys.',
    placeholder: 're_1234567890abcdef',
    value: '',
  },
  {
    key: 'TELEGRAM_WEBHOOK_SECRET',
    label: 'Telegram Webhook Secret',
    description: 'Arbitrary secret used to verify inbound webhook calls (add ?secret_token= to webhook URL).',
    placeholder: 'openssl rand -hex 32',
    value: '',
  },
  {
    key: 'WHATSAPP_ACCESS_TOKEN',
    label: 'WhatsApp Access Token (reserved)',
    description: 'Meta Cloud API token — NOT free/easy. Requires Meta Business verification. Placeholder for future official integration.',
    placeholder: 'EAAxxxx...',
    value: '',
  },
  {
    key: 'WHATSAPP_PHONE_NUMBER_ID',
    label: 'WhatsApp Phone Number ID (reserved)',
    description: 'Meta Cloud API phone number ID — paired with Access Token above.',
    placeholder: '123456789012345',
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
