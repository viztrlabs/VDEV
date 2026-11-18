'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// -----------------------------------------------------------------------
// Model Settings Store
// Persists user-configurable AI model preferences + provider selection.
// These values override the hardcoded defaults in viztr-agent.ts at runtime.
// -----------------------------------------------------------------------

export type AIProvider = 'gemini' | 'openrouter' | 'openai';

export interface ModelConfig {
  provider: AIProvider;
  enabled: boolean;
  models: string[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeoutMs?: number;
}

export interface ModelSettingsState {
  // Provider configs (keyed by provider name)
  providers: Record<AIProvider, ModelConfig>;
  // Active provider priority order (first = primary)
  priorityOrder: AIProvider[];
  // System prompt overrides
  systemPrompt: string;
  escalationPrompt: string;
  // Last test result
  lastTestResult?: { provider: AIProvider; ok: boolean; ms: number; error?: string };

  setProviderConfig: (provider: AIProvider, config: Partial<ModelConfig>) => void;
  setPriorityOrder: (order: AIProvider[]) => void;
  reorderPriority: (from: number, to: number) => void;
  setPrompt: (key: 'systemPrompt' | 'escalationPrompt', value: string) => void;
  setTestResult: (result: ModelSettingsState['lastTestResult']) => void;
  resetToDefaults: () => void;
}

const DEFAULT_PROVIDERS: Record<AIProvider, ModelConfig> = {
  gemini: {
    provider: 'gemini',
    enabled: true,
    models: ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    timeoutMs: 30000,
  },
  openrouter: {
    provider: 'openrouter',
    enabled: true,
    models: ['google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    timeoutMs: 30000,
  },
  openai: {
    provider: 'openai',
    enabled: false,
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    timeoutMs: 30000,
  },
};

const DEFAULT_PRIORITY: AIProvider[] = ['gemini', 'openrouter', 'openai'];

const DEFAULT_SYSTEM_PROMPT = `You are Hermes, the AI assistant for VizTR — a studio that produces architectural visualization, WebXR/WebAR experiences, 360° virtual tours, and AI-generated marketing for architecture firms. Be concise, professional, and helpful. If asked about technical topics, reference VizTR's stack: PlayCanvas WebXR and Marzipano 360 tours.`;

const DEFAULT_ESCALATION_PROMPT = `You are Hermes. The user asked a question you couldn't answer from the knowledge base.
Politely explain that you'll escalate to a human specialist who will respond shortly.
Ask if they'd like to provide any additional details (budget, timeline, project type) to help the specialist.
Keep it brief and professional.`;

export const useModelSettingsStore = create<ModelSettingsState>()(
  persist(
    (set, get) => ({
      providers: { ...DEFAULT_PROVIDERS },
      priorityOrder: [...DEFAULT_PRIORITY],
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      escalationPrompt: DEFAULT_ESCALATION_PROMPT,

      setProviderConfig: (provider, config) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: { ...state.providers[provider], ...config },
          },
        })),

      setPriorityOrder: (order) => set({ priorityOrder: order }),

      reorderPriority: (from, to) =>
        set((state) => {
          const order = [...state.priorityOrder];
          const [moved] = order.splice(from, 1);
          order.splice(to, 0, moved);
          return { priorityOrder: order };
        }),

      setPrompt: (key, value) => set({ [key]: value }),

      setTestResult: (result) => set({ lastTestResult: result }),

      resetToDefaults: () =>
        set({
          providers: { ...DEFAULT_PROVIDERS },
          priorityOrder: [...DEFAULT_PRIORITY],
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          escalationPrompt: DEFAULT_ESCALATION_PROMPT,
          lastTestResult: undefined,
        }),
    }),
    { name: 'viztr-model-settings' }
  )
);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Get the effective model list for a provider (user config or default) */
export function getEffectiveModels(provider: AIProvider): string[] {
  const state = useModelSettingsStore.getState();
  return state.providers[provider]?.models ?? DEFAULT_PROVIDERS[provider].models;
}

/** Get the effective system prompt */
export function getEffectiveSystemPrompt(): string {
  return useModelSettingsStore.getState().systemPrompt || DEFAULT_SYSTEM_PROMPT;
}

/** Get the effective escalation prompt */
export function getEffectiveEscalationPrompt(): string {
  return useModelSettingsStore.getState().escalationPrompt || DEFAULT_ESCALATION_PROMPT;
}

/** Get the ordered list of enabled providers */
export function getEnabledProviders(): AIProvider[] {
  const state = useModelSettingsStore.getState();
  return state.priorityOrder.filter(
    (p) => state.providers[p]?.enabled
  );
}

/** Get provider config */
export function getProviderConfig(provider: AIProvider): ModelConfig | undefined {
  return useModelSettingsStore.getState().providers[provider];
}