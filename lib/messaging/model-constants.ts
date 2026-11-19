/**
 * Server-side AI model constants and helpers.
 * No client-side store dependency — safe for API routes.
 */

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

export const DEFAULT_PROVIDERS: Record<AIProvider, ModelConfig> = {
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

export const DEFAULT_PRIORITY: AIProvider[] = ['gemini', 'openrouter', 'openai'];

export const DEFAULT_SYSTEM_PROMPT = `You are Hermes, the AI assistant for VizTR — a studio that produces architectural visualization, WebXR/WebAR experiences, 360° virtual tours, and AI-generated marketing for architecture firms. Be concise, professional, and helpful. If asked about technical topics, reference VizTR's stack: PlayCanvas WebXR and Marzipano 360 tours.`;

export const DEFAULT_ESCALATION_PROMPT = `You are Hermes. The user asked a question you couldn't answer from the knowledge base.
Politely explain that you'll escalate to a human specialist who will respond shortly.
Ask if they'd like to provide any additional details (budget, timeline, project type) to help the specialist.
Keep it brief and professional.`;

// Server-side helpers (no client store)
export function getEffectiveModels(provider: AIProvider): string[] {
  return DEFAULT_PROVIDERS[provider]?.models ?? [];
}

export function getEffectiveSystemPrompt(): string {
  return DEFAULT_SYSTEM_PROMPT;
}

export function getEffectiveEscalationPrompt(): string {
  return DEFAULT_ESCALATION_PROMPT;
}

export function getEnabledProviders(): AIProvider[] {
  return DEFAULT_PRIORITY.filter((p) => DEFAULT_PROVIDERS[p]?.enabled);
}

export function getProviderConfig(provider: AIProvider): ModelConfig | undefined {
  return DEFAULT_PROVIDERS[provider];
}