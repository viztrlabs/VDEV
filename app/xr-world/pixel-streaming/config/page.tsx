'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Loader2, Wifi, Cpu, Settings, Box, Clock, LayoutDashboard } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { StreamTab } from './tabs/StreamTab';
import { GPUTab } from './tabs/GPUTab';
import { QualityTab } from './tabs/QualityTab';
import { UnrealTab } from './tabs/UnrealTab';
import { SignalingTab } from './tabs/SignalingTab';
import { SessionTab } from './tabs/SessionTab';
import { notifyEditorSave } from '@/lib/editor-sync';

interface PixelStreamingConfig {
  stream: {
    streamId: string;
    signalingUrl: string;
    turnServers: Array<{ urls: string; username?: string; credential?: string }>;
    protocol: 'webrtc' | 'rtc';
    protocolVersion: '1' | '2';
    fps: 30 | 60 | 120;
    bitrate: number;
    codec: 'h264' | 'h265' | 'vp9';
    resolution: string;
    lowLatency: boolean;
  };
  gpu: {
    model: string;
    vram: string;
    region: string;
    instanceType: string;
    maxConcurrentSessions: number;
  };
  quality: {
    resolution: '720p' | '1080p' | '2k' | '4k';
    fps: 30 | 60 | 120;
    bitrate: number;
    codec: 'h264' | 'h265' | 'vp9';
  };
  unreal: {
    projectPath: string;
    projectVersion: string;
    version: string;
    buildId?: string;
    commandLineArgs?: string;
    map?: string;
  };
  signaling: {
    url: string;
    protocol: 'ws' | 'wss';
    iceServers: Array<{ urls: string; username?: string; credential?: string }>;
    reconnectAttempts: number;
    reconnectInterval: number;
  };
  session: {
    maxDuration: number;
    idleTimeout: number;
    autoStart: boolean;
    autoRestart: boolean;
    maxConcurrentSessions: number;
  };
  metadata: {
    version: number;
    createdAt: string;
    updatedAt: string;
    author?: string;
    description?: string;
    tags?: string[];
    serviceType: 'pixel-streaming';
    projectId?: string;
    experienceId?: string;
    streamId?: string;
  };
}

function getDefaultConfig(): PixelStreamingConfig {
  return {
    stream: {
      streamId: 'apex-tower-ue5',
      signalingUrl: process.env.NEXT_PUBLIC_PS_SIGNALING_URL || 'wss://stream.viztr.io',
      turnServers: [
        {
          urls: process.env.PS_TURN_URL || 'turn:turn.viztr.io:3478',
          username: process.env.PS_TURN_USER || 'viztr',
          credential: process.env.PS_TURN_CREDENTIAL,
        },
      ],
      protocol: 'webrtc',
      protocolVersion: '2',
      fps: 60,
      bitrate: 50000,
      codec: 'h265',
      resolution: '3840x2160',
      lowLatency: true,
    },
    gpu: {
      model: 'NVIDIA RTX 4090',
      vram: '24GB',
      region: 'eu-central-1',
      instanceType: 'g5.24xlarge',
      maxConcurrentSessions: 1,
    },
    quality: {
      resolution: '4k',
      fps: 60,
      bitrate: 50000,
      codec: 'h265',
    },
    unreal: {
      projectPath: '/Game/Projects/ApexTower',
      projectVersion: '1.0.0',
      version: 'UE5.4',
      buildId: undefined,
      commandLineArgs: '',
      map: '/Game/Maps/ApexTower',
    },
    signaling: {
      url: process.env.NEXT_PUBLIC_PS_SIGNALING_URL || 'wss://stream.viztr.io',
      protocol: 'wss',
      iceServers: [
        {
          urls: process.env.PS_TURN_URL || 'turn:turn.viztr.io:3478',
          username: process.env.PS_TURN_USER || 'viztr',
          credential: process.env.PS_TURN_CREDENTIAL,
        },
      ],
      reconnectAttempts: 5,
      reconnectInterval: 5000,
    },
    session: {
      maxDuration: 120,
      idleTimeout: 300,
      autoStart: false,
      autoRestart: true,
      maxConcurrentSessions: 1,
    },
    metadata: {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'VizTR Platform',
      description: 'Pixel Streaming Experience Configuration',
      tags: ['pixel-streaming', 'unreal-engine', 'ue5', 'webRTC', 'cloud-gpu'],
      serviceType: 'pixel-streaming',
    },
  };
}

const tabs = [
  { id: 'overview' as const, label: 'Overview', Icon: LayoutDashboard },
  { id: 'stream' as const, label: 'Stream', Icon: Wifi },
  { id: 'gpu' as const, label: 'GPU', Icon: Cpu },
  { id: 'quality' as const, label: 'Quality', Icon: Settings },
  { id: 'unreal' as const, label: 'Unreal', Icon: Box },
  { id: 'signaling' as const, label: 'Signaling', Icon: Wifi },
  { id: 'session' as const, label: 'Session', Icon: Clock },
];

type TabId = typeof tabs[number]['id'];

export default function PixelStreamingConfigPage() {
  const params = useParams<{ projectId?: string; experienceId?: string }>();
  const projectId = params?.projectId || 'proj_smart_luxury_villa';
  const experienceId = params?.experienceId;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [config, setConfig] = useState<PixelStreamingConfig>(getDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading configuration...');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setStatus('Loading configuration...');
        if (experienceId) {
          const expRes = await fetch(`/api/experience-configs?experienceId=${encodeURIComponent(experienceId)}`);
          const expData = await expRes.json();
          if (expData.success && expData.configs && expData.configs.length > 0) {
            const cfg = expData.configs[0].config;
            if (cfg) {
              setConfig(prev => ({ ...prev, ...cfg }));
            }
          }
        }
        setStatus('Configuration loaded');
      } catch (e: any) {
        setError(e?.message || 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [experienceId]);

  const handleInputChange = (path: string, value: any) => {
    setConfig(prev => {
      const keys = path.split('.');
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        experience_id: experienceId || '',
        config: config.stream,
        assets: [],
        settings: {
          stream: config.stream,
          gpu: config.gpu,
          quality: config.quality,
          unreal: config.unreal,
          signaling: config.signaling,
          session: config.session,
          metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
        },
      };
      const response = await fetch('/api/experience-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to save' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      setSaved(true);
      notifyEditorSave();
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    const props = { config, onChange: handleInputChange };
    switch (activeTab) {
      case 'overview': return <OverviewTab {...props} />;
      case 'stream': return <StreamTab {...props} />;
      case 'gpu': return <GPUTab {...props} />;
      case 'quality': return <QualityTab {...props} />;
      case 'unreal': return <UnrealTab {...props} />;
      case 'signaling': return <SignalingTab {...props} />;
      case 'session': return <SessionTab {...props} />;
      default: return <OverviewTab {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A] flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-white">Pixel Streaming Config</h1>
          <p className="text-[10px] font-mono text-[#71717A]">{projectId} / pixel-streaming</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717A]">{status}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-semibold transition ${
              saving
                ? 'bg-[#121216] text-[#71717A] border-[#27272A] cursor-not-allowed'
                : 'bg-[#3ECF8E]/15 text-[#3ECF8E] border-[#3ECF8E]/40 hover:bg-[#3ECF8E]/25'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Config</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border-b border-[#27272A] px-4">
        <nav className="flex gap-1 pb-3" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg text-[10px] font-mono font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#121216] text-[#3ECF8E] border-b-2 border-[#3ECF8E]'
                  : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#121216]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[#3ECF8E] animate-spin" />
            <span className="ml-2 text-xs font-mono text-[#71717A]">Loading configuration...</span>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] font-mono text-rose-300 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200 text-xs">x</button>
              </div>
            )}
            {saved && (
              <div className="mb-4 rounded border border-emerald-500/40 bg-emerald-500/10 p-3 text-[11px] font-mono text-emerald-300">
                Configuration saved successfully
              </div>
            )}
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
