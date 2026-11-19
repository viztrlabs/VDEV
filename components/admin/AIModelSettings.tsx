'use client';

import React, { useState, useEffect } from 'react';
import { useModelSettingsStore } from '@/lib/messaging/model-settings-store';
import {
  Zap,
  Brain,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Palette,
  MessageCircle,
  MessageSquare,
  Mic,
  MicOff,
  FileText,
  Folder,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';

interface ProviderFormProps {
  provider: 'gemini' | 'openrouter' | 'openai';
  setProviderConfig: (provider: 'gemini' | 'openrouter' | 'openai', config: Partial<{ enabled: boolean; models: string[]; temperature?: number; maxTokens?: number; topP?: number; timeoutMs?: number }>) => void;
  getProviderConfig: (provider: 'gemini' | 'openrouter' | 'openai') => { enabled: boolean; models: string[]; temperature?: number; maxTokens?: number; topP?: number; timeoutMs?: number } | undefined;
}

const DEFAULT_MODELS: Record<'gemini' | 'openrouter' | 'openai', string[]> = {
  gemini: ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  openrouter: ['google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
};

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, setProviderConfig, getProviderConfig }) => {
  const config = getProviderConfig(provider);
  const [newModel, setNewModel] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddModel, setShowAddModel] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProviderConfig(provider, { enabled: e.target.checked });
  };

  // Gemini API key state
  const [geminiApiKey, setGeminiApiKey] = useState('');
  // OpenRouter API key state
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  // OpenAI API key state
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const apiKey = provider === 'gemini' ? geminiApiKey : 
    provider === 'openrouter' ? openrouterApiKey : 
    openaiApiKey;

  const setApiKey = (value: string) => {
    if (provider === 'gemini') setGeminiApiKey(value);
    else if (provider === 'openrouter') setOpenrouterApiKey(value);
    else setOpenaiApiKey(value);
  };

  const models = config?.models || [...DEFAULT_MODELS[provider]];
  const handleAddModel = () => {
    if (!newModel.trim() || models.includes(newModel.trim())) return;
    setProviderConfig(provider, { models: [...models, newModel.trim()] });
    setNewModel('');
    setShowAddModel(false);
  };

  const handleRemoveModel = (index: number) => {
    const updated = models.filter((_, i) => i !== index);
    setProviderConfig(provider, { models: updated });
  };

  const handleEditModel = (index: number, newValue: string) => {
    const updated = [...models];
    updated[index] = newValue;
    setProviderConfig(provider, { models: updated });
    setEditingIndex(null);
  };

  const temperature = config?.temperature ?? 0.7;
  const maxTokens = config?.maxTokens ?? 2048;
  const topP = config?.topP ?? 0.9;
  const timeoutMs = config?.timeoutMs ?? 30000;

  // Fetch models from provider API
  const fetchModels = async () => {
    setFetchStatus('loading');
    setFetchError(null);
    
    const providerApiKey = provider === 'gemini' ? geminiApiKey : 
      provider === 'openrouter' ? openrouterApiKey : 
      openaiApiKey;
    
    if (!providerApiKey) {
      setFetchStatus('error');
      setFetchError('API key not configured. Add ' + provider + ' API key to .env.local');
      return;
    }

    try {
      let models: string[];
      
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${providerApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch OpenAI models: ' + response.status);
        const data = await response.json();
        models = data.data.map((m: any) => m.id);
      } else if (provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${providerApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch OpenRouter models: ' + response.status);
        const data = await response.json();
        models = data.data.map((m: any) => m.id);
      } else {
        throw new Error('Gemini model listing not directly available via API. Using defaults.');
      }
      
      setProviderConfig(provider, { models });
      setFetchStatus('success');
    } catch (error) {
      console.error(`[AIModelSettings] Failed to fetch ${provider} models:`, error);
      setFetchStatus('error');
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch models');
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config?.enabled ?? true}
            onChange={handleEnableChange}
            className="rounded accent-purple-600"
          />
          <span className="text-zinc-300 font-mono text-sm">{provider.toUpperCase()} Provider</span>
        </label>
      </div>

      {/* API Key Placeholder */}
      <div className="flex items-center gap-2 rounded-lg border border-zinc-600 p-2 bg-zinc-900 mb-3">
        <span className="text-xs text-zinc-400 font-mono">API Key:</span>
        <input
          type="password"
          value={apiKey || ''}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          placeholder="sk-... or GOOGLE_API_KEY..."
        />
      </div>

      {/* Model List with Dropdown */}
      <div>
        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Model List</h4>
        <div className="flex gap-2 rounded-lg border border-zinc-600 p-3 bg-zinc-900">
          {/* Default models section */}
          <div className="flex items-center gap-2">
            <select
              defaultValue={models[0]}
              onChange={(e) => {
                const selected = e.target.value;
                if (!models.includes(selected)) return;
                setProviderConfig(provider, { models: [selected, ...models.filter(m => m !== selected)] });
              }}
              className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer w-32"
            >
              <option value="" disabled>
                Select model
              </option>
              {models.map((m, i) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModel(true)}
              className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-700/30 text-purple-400 text-xs transition-colors cursor-pointer"
              title="Add new model"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            {fetchStatus === 'loading' && (
              <span className="text-xs text-purple-400">Fetching models...</span>
            )}
            {fetchStatus === 'success' && (
              <span className="text-xs text-emerald-400">Models synced from provider</span>
            )}
            {fetchStatus === 'error' && (
              <span className="text-xs text-rose-400">{fetchError}</span>
            )}
          </div>

          {/* Current models display */}
          {models.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {models.map((model, idx) => (
                <div
                  key={model}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-300"
                >
                  {model}
                  {idx < models.length - 1 && (
                    <span className="text-zinc-500">,</span>
                  )}
                  <button
                    onClick={() => handleRemoveModel(idx)}
                    className="p-0.5 rounded bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 text-[8px] transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add model dropdown */}
          {showAddModel && (
            <div className="mt-2 space-y-2">
              <select
                className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                onChange={(e) => setNewModel(e.target.value)}
              >
                <option value="" disabled>
                  Select a model
                </option>
                {DEFAULT_MODELS[provider].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddModel}
                className="w-full px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs transition-colors cursor-pointer"
                title="Add model"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModel(false)}
                className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-600 text-zinc-400 text-xs transition-colors cursor-pointer"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fetch Models Button */}
      <button
        onClick={fetchModels}
        className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer mt-2"
        title="Fetch available models from provider"
      >
        {provider === 'openai' ? 'Fetch OpenAI Models' : provider === 'openrouter' ? 'Fetch OpenRouter Models' : 'Fetch Gemini Models'}
      </button>

      {/* Tuning Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Temperature</h4>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setProviderConfig(provider, { temperature: Number(e.target.value) })}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Max Tokens</h4>
          <input
            type="number"
            min={1}
            value={maxTokens}
            onChange={(e) => setProviderConfig(provider, { maxTokens: Number(e.target.value) })}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Top P</h4>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={topP}
            onChange={(e) => setProviderConfig(provider, { topP: Number(e.target.value) })}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Timeout (ms)</h4>
          <input
            type="number"
            min={100}
            value={timeoutMs}
            onChange={(e) => setProviderConfig(provider, { timeoutMs: Number(e.target.value) })}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

interface PriorityOrderProps {
  setProviderConfig: (provider: 'gemini' | 'openrouter' | 'openai', config: Partial<{ enabled: boolean }>) => void;
  setPriorityOrder: (order: ('gemini' | 'openrouter' | 'openai')[]) => void;
  reorderPriority: (from: number, to: number) => void;
  getEnabledProviders: () => ('gemini' | 'openrouter' | 'openai')[];
}

const PriorityOrder: React.FC<PriorityOrderProps> = ({ setProviderConfig, setPriorityOrder, reorderPriority, getEnabledProviders }) => {
  const enabled = getEnabledProviders();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div>
      <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Priority Order</h4>
      <p className="text-xs text-zinc-500 mb-3">
        {enabled.length > 0 ? ('Enabled: ' + enabled.map((p) => p.toUpperCase()).join(', ')) : 'No providers enabled'}
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-zinc-600 p-3 bg-zinc-900">
        {enabled.map((provider, index) => (
          <div key={provider} className="flex items-center gap-2">
            <span className="w-8 text-xs font-mono text-zinc-300">{index + 1}.</span>
            <span className="flex-1 bg-zinc-800 border rounded px-3 py-1 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer" onClick={() => setProviderConfig(provider, { enabled: true })}>{provider.toUpperCase()}</span>
            {index < enabled.length - 1 && (
              <button
                onClick={() => reorderPriority(index, index + 1)}
                className="p-1 rounded bg-purple-600/20 hover:bg-purple-700/30 text-purple-400 text-xs transition-colors cursor-pointer"
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
            {index > 0 && (
              <button
                onClick={() => reorderPriority(index, index - 1)}
                className="p-1 rounded bg-purple-600/20 hover:bg-purple-700/30 text-purple-400 text-xs transition-colors cursor-pointer"
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface PromptOverrideProps {
  setPrompt: (key: 'systemPrompt' | 'escalationPrompt', value: string) => void;
  getEffectiveSystemPrompt: () => string;
  getEffectiveEscalationPrompt: () => string;
}

const PromptOverride: React.FC<PromptOverrideProps> = ({ setPrompt, getEffectiveSystemPrompt, getEffectiveEscalationPrompt }) => {
  const [systemPrompt, setSystemPrompt] = useState(getEffectiveSystemPrompt());
  const [escalationPrompt, setEscalationPrompt] = useState(getEffectiveEscalationPrompt());

  return (
    <div>
      <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">System Prompt</h4>
      <textarea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        rows={3}
        className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-y mb-4"
      />
      <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Escalation Prompt</h4>
      <textarea
        value={escalationPrompt}
        onChange={(e) => setEscalationPrompt(e.target.value)}
        rows={3}
        className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-y"
      />
    </div>
  );
};

export default function AIModelSettings() {
  const {
    providers,
    priorityOrder,
    systemPrompt,
    escalationPrompt,
    setProviderConfig,
    setPriorityOrder,
    reorderPriority,
    setPrompt,
    resetToDefaults,
  } = useModelSettingsStore();

  return (
    <div className="space-y-6">
      {/* Provider Forms Section */}
      <div>
        <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4">Model Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          {['gemini', 'openrouter', 'openai'].map((provider) => {
            const config = providers[provider as 'gemini' | 'openrouter' | 'openai'];
            const isEnabled = config?.enabled ?? false;
            return (
              <div key={provider} className={`p-4 rounded-xl border ${
                isEnabled ? 'border-purple-500/50' : 'border-zinc-700/30'}
                bg-zinc-900 ${!isEnabled && 'opacity-50'}
              `}>
                <h4 className="text-xs font-mono font-bold text-white mb-3 uppercase tracking-wider">
                  {provider.toUpperCase()}
                </h4>
                <ProviderForm
                  provider={provider as 'gemini' | 'openrouter' | 'openai'}
                  setProviderConfig={setProviderConfig}
                  getProviderConfig={() => config}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Order Section */}
      <PriorityOrder
        setProviderConfig={setProviderConfig}
        setPriorityOrder={setPriorityOrder}
        reorderPriority={reorderPriority}
        getEnabledProviders={() => priorityOrder.filter(p => providers[p]?.enabled)}
      />

      {/* Prompt Overrides Section */}
      <PromptOverride
        setPrompt={setPrompt}
        getEffectiveSystemPrompt={() => useModelSettingsStore.getState().systemPrompt || systemPrompt}
        getEffectiveEscalationPrompt={() => useModelSettingsStore.getState().escalationPrompt || escalationPrompt}
      />

      {/* Reset Defaults */}
      <div className="flex justify-end">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
          title="Reset all AI model settings to defaults"
        >
          Reset Defaults
        </button>
      </div>
    </div>
  );
}