'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  Users,
  BarChart3,
  RefreshCw,
  Clock,
  Target,
  FileText,
  Settings,
  Eye,
  TrendingUp,
  TrendingDown,
  Gauge,
  Sparkles,
} from 'lucide-react';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type AITab =
  | 'overview'
  | 'predictive'
  | 'nlp'
  | 'automation'
  | 'mlpipeline'
  | 'governance'
  | 'collaboration';

interface ModelInfo {
  id: string;
  name: string;
  type: string;
  version: string;
  status: string;
  framework: string;
  lastUpdated: string;
}

interface RuleInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: { event: string; threshold?: number };
  actionCount: number;
}

interface PolicyInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  severity: string;
  enabled: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: number;
  modelId: string;
  action: string;
  decision: string;
  policyViolations: string[];
}

interface PlatformStatus {
  components: Record<string, string>;
  models_deployed: number;
  rules_active: number;
  policies: number;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export default function AIDashboardPanel() {
  const [activeTab, setActiveTab] = useState<AITab>('overview');
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [rules, setRules] = useState<RuleInfo[]>([]);
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // NLP test state
  const [nlpInput, setNlpInput] = useState('');
  const [nlpResult, setNlpResult] = useState<any>(null);

  // Predictive test state
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // Collaboration state
  const [collabAgents, setCollabAgents] = useState<any[]>([]);
  const [collabMetrics, setCollabMetrics] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [collabSessionName, setCollabSessionName] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'x-user-role': 'SUPER_ADMIN' };

      const [statusRes, modelsRes, rulesRes, policiesRes, auditRes, collabAgentsRes, collabMetricsRes] = await Promise.all([
        fetch('/api/ai?action=status', { headers }).then(r => r.json()),
        fetch('/api/ai?action=models', { headers }).then(r => r.json()),
        fetch('/api/ai?action=rules', { headers }).then(r => r.json()),
        fetch('/api/ai?action=policies', { headers }).then(r => r.json()),
        fetch('/api/ai?action=audit-log&limit=30', { headers }).then(r => r.json()),
        fetch('/api/ai?action=collab-agents', { headers }).then(r => r.json()),
        fetch('/api/ai?action=collab-metrics', { headers }).then(r => r.json()),
      ]);

      if (statusRes.success) setStatus(statusRes);
      if (modelsRes.success) setModels(modelsRes.models);
      if (rulesRes.success) setRules(rulesRes.rules);
      if (policiesRes.success) setPolicies(policiesRes.policies);
      if (auditRes.success) setAuditLog(auditRes.logs);
      if (collabAgentsRes.success) setCollabAgents(collabAgentsRes.agents);
      if (collabMetricsRes.success) setCollabMetrics(collabMetricsRes.metrics);
    } catch (err) {
      console.error('[AIDashboard] fetch error', err);
    }
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  // Create collaboration session
  const handleCreateSession = useCallback(async () => {
    if (!collabSessionName.trim()) return;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
        body: JSON.stringify({
          action: 'create_collab_session',
          name: collabSessionName,
          ownerId: 'admin-user',
          ownerName: 'Admin User',
          ownerEmail: 'admin@viztr.local',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentSession(data.session);
        setCollabSessionName('');
        fetchAll();
      }
    } catch (err) {
      console.error('[AIDashboard] create session error', err);
    }
  }, [collabSessionName, fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Process NLP command
  const processNLP = async () => {
    if (!nlpInput.trim()) return;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
        body: JSON.stringify({ action: 'process_nlp', text: nlpInput }),
      });
      const data = await res.json();
      setNlpResult(data);
    } catch (err) {
      console.error('[NLP] error', err);
    }
  };

  // Predict user behavior
  const predictUser = async () => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
        body: JSON.stringify({
          action: 'predict_user',
          userProfile: {
            userId: 'demo-user-1',
            username: 'architect_alice',
            email: 'alice@viztr.io',
            role: 'ADMIN',
            joinDate: '2025-06-01',
            lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            activityLevel: 'medium',
            collaborationScore: 0.65,
            performanceScore: 0.72,
            churnRiskScore: 0.3,
            weeklyHours: 18,
            taskCompletionRate: 0.82,
            communicationFrequency: 4,
            projectDiversity: 3,
            skillSet: ['3D Modeling', 'WebXR'],
            preferenceTags: ['formal'],
          },
        }),
      });
      const data = await res.json();
      setPredictionResult(data.prediction);
    } catch (err) {
      console.error('[Predict] error', err);
    }
  };

  // Tab config
  const tabs: { id: AITab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Platform Overview', icon: Brain },
    { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'nlp', label: 'NLP Engine', icon: FileText },
    { id: 'automation', label: 'Automation Rules', icon: Zap },
    { id: 'ml-pipeline', label: 'ML Pipeline', icon: Cpu },
    { id: 'governance', label: 'AI Governance', icon: Shield },
    { id: 'collaboration', label: 'AI Collaboration', icon: Users },
  ];

  const statusColor = (s: string) =>
    s === 'operational' ? 'text-emerald-400' : s === 'deployed' ? 'text-emerald-400' : 'text-amber-400';
  const decisionColor = (d: string) =>
    d === 'approved' ? 'text-emerald-400' : d === 'rejected' ? 'text-rose-400' : 'text-amber-400';
  const severityColor = (s: string) =>
    s === 'required' ? 'text-amber-400' : s === 'prohibited' ? 'text-rose-400' : 'text-sky-400';

  return (
    <div className="space-y-6" id="ai-dashboard-panel">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
            <Brain className="w-4 h-4" />
            <span>PHASE 3 — AI PLATFORM</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            AI / ML Platform Dashboard
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Predictive analytics, NLP, automation rules, ML pipeline & governance — all in one place.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-white hover:border-[#3ECF8E] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* STATUS BAR */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(status.components).map(([key, val]) => (
            <div
              key={key}
              className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${val === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-mono text-[#A1A1AA] capitalize">
                {key.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-[#27272A]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#09090B] text-[#3ECF8E] border-t-2 border-l-2 border-r-2 border-[#3ECF8E]/40 font-bold'
                  : 'text-[#71717A] hover:text-white hover:bg-[#09090B]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3ECF8E]' : ''}`} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== TAB: OVERVIEW ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                <span>DEPLOYED MODELS</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{status?.models_deployed ?? 0}</div>
              <div className="text-[10px] text-[#3ECF8E]">Production active</div>
            </div>
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                <span>ACTIVE RULES</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{status?.rules_active ?? 0}</div>
              <div className="text-[10px] text-[#3ECF8E]">Automation engine</div>
            </div>
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                <span>GOVERNANCE POLICIES</span>
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{status?.policies ?? 0}</div>
              <div className="text-[10px] text-sky-400">Active controls</div>
            </div>
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-mono">
                <span>AUDIT ENTRIES</span>
                <Eye className="w-4 h-4 text-[#3ECF8E]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{auditLog.length}</div>
              <div className="text-[10px] text-[#A1A1AA]">Last 30 actions</div>
            </div>
          </div>

          {/* Component Health Grid */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white">Component Health</h3>
              <span className="text-[10px] font-mono text-[#3ECF8E]">Real-time status</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {status &&
                Object.entries(status.components).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-[#121214] border border-[#27272A] flex items-center gap-3"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${val === 'operational' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
                    />
                    <div>
                      <div className="text-xs font-mono text-white capitalize">{key.replace(/_/g, ' ')}</div>
                      <div className={`text-[10px] font-mono ${statusColor(val)}`}>
                        {val.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Audit Log */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white">Recent AI Audit Log</h3>
              <button
                onClick={() => setActiveTab('governance')}
                className="text-[10px] font-mono text-[#3ECF8E] hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>
            {auditLog.length === 0 ? (
              <p className="text-xs text-[#71717A] font-mono">No audit entries yet. Actions will appear here.</p>
            ) : (
              <div className="space-y-1">
                {auditLog.slice(-5).reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className={decisionColor(entry.decision)}>
                        {entry.decision === 'approved' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : entry.decision === 'rejected' ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="text-white">{entry.action}</span>
                      <span className="text-[#71717A]">→ {entry.modelId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.policyViolations.length > 0 && (
                        <span className="text-amber-400">
                          {entry.policyViolations.length} violation(s)
                        </span>
                      )}
                      <span className="text-[#52525B]">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: PREDICTIVE ===== */}
      {activeTab === 'predictive' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3ECF8E]" />
                User Churn Prediction (Heuristic Demo)
              </h3>
              <button
                onClick={predictUser}
                className="px-3 py-1.5 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[11px] font-mono text-[#3ECF8E] hover:bg-[#3ECF8E]/20 cursor-pointer transition-colors"
              >
                Run Prediction
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Uses behavioral heuristics (activity recency, task completion, communication frequency)
              to predict user churn risk. In production this connects to the ML pipeline.
            </p>

            {predictionResult && (
              <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Churn Risk</div>
                    <div className={`text-lg font-bold font-mono ${predictionResult.churnRisk > 0.6 ? 'text-rose-400' : predictionResult.churnRisk > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(predictionResult.churnRisk * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Engagement</div>
                    <div className="text-lg font-bold font-mono text-white capitalize">{predictionResult.engagementForecast}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Confidence</div>
                    <div className="text-lg font-bold font-mono text-sky-400">{(predictionResult.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Next Active</div>
                    <div className="text-lg font-bold font-mono text-[#3ECF8E]">~{predictionResult.nextActiveWindow?.start}m</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                  <div className="text-[10px] font-mono text-[#A1A1AA] uppercase mb-1">Recommended Action</div>
                  <p className="text-xs text-white">{predictionResult.recommendedAction}</p>
                </div>
              </div>
            )}
          </div>

          {/* Project Risk Assessment */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Project Risk Assessment
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Analyzes project timeline slippage, budget burn, revision count, and client feedback
              to produce a risk score and actionable recommendations.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-center">
                <div className="text-[10px] font-mono text-[#71717A] uppercase">Timeline</div>
                <div className="text-sm font-bold text-white mt-1">✅ On Track</div>
              </div>
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-center">
                <div className="text-[10px] font-mono text-[#71717A] uppercase">Budget</div>
                <div className="text-sm font-bold text-amber-400 mt-1">⚠ 72% Used</div>
              </div>
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-center">
                <div className="text-[10px] font-mono text-[#71717A] uppercase">Revisions</div>
                <div className="text-sm font-bold text-white mt-1">3 / 20</div>
              </div>
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-center">
                <div className="text-[10px] font-mono text-[#71717A] uppercase">Client Score</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">4.2 / 5</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: NLP ===== */}
      {activeTab === 'nlp' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3ECF8E]" />
              Natural Language Processing Engine
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Type a command in natural language. The engine extracts intent, entities, sentiment, and urgency.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && processNLP()}
                placeholder='e.g. "Schedule a meeting with @john about #VIZTR-882 by tomorrow"'
                className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#52525B] focus:outline-none focus:border-[#3ECF8E]"
              />
              <button
                onClick={processNLP}
                className="px-4 py-2 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-xs font-mono text-[#3ECF8E] hover:bg-[#3ECF8E]/20 cursor-pointer transition-colors"
              >
                Process
              </button>
            </div>

            {/* Quick test buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                'Schedule meeting with @alice about #VIZTR-882 by tomorrow',
                'Create task: review 3D render for client',
                'What is the status of project PROJ-123?',
                'Help with broken pixel streaming',
                'Assign resource @bob to VIZTR-900',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setNlpInput(example);
                    setTimeout(processNLP, 100);
                  }}
                  className="px-2 py-1 rounded-lg bg-[#09090B] border border-[#27272A] text-[10px] font-mono text-[#71717A] hover:text-white hover:border-[#3ECF8E]/50 cursor-pointer transition-colors"
                >
                  {example.slice(0, 40)}...
                </button>
              ))}
            </div>

            {/* NLP Result */}
            {nlpResult && nlpResult.success && (
              <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Intent</div>
                    <div className="text-sm font-bold text-[#3ECF8E] font-mono capitalize">
                      {nlpResult.intent.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Confidence</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {(nlpResult.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Sentiment</div>
                    <div className={`text-sm font-bold font-mono capitalize ${nlpResult.sentiment === 'positive' ? 'text-emerald-400' : nlpResult.sentiment === 'negative' ? 'text-rose-400' : 'text-white'}`}>
                      {nlpResult.sentiment}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase">Urgency</div>
                    <div className={`text-sm font-bold font-mono capitalize ${nlpResult.urgency === 'high' ? 'text-rose-400' : nlpResult.urgency === 'medium' ? 'text-amber-400' : 'text-white'}`}>
                      {nlpResult.urgency}
                    </div>
                  </div>
                </div>
                {nlpResult.entities && nlpResult.entities.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase mb-1">Extracted Entities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {nlpResult.entities.map((e: any, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]"
                        >
                          <span className="text-[#3ECF8E]">{e.type}:</span> {e.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: AUTOMATION ===== */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Automation Rules Engine
              </h3>
              <span className="text-[10px] font-mono text-[#71717A]">
                {rules.filter(r => r.enabled).length} of {rules.length} active
              </span>
            </div>

            {rules.length === 0 ? (
              <p className="text-xs text-[#71717A] font-mono">No automation rules configured.</p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-start justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-400' : 'bg-[#52525B]'}`} />
                        <span className="text-sm font-bold text-white">{rule.name}</span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA]">{rule.description}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#71717A]">
                        <span>Trigger: <span className="text-amber-400">{rule.trigger.event}</span></span>
                        {rule.trigger.threshold && <span>Threshold: <span className="text-white">{rule.trigger.threshold}</span></span>}
                        <span>Actions: <span className="text-white">{rule.actionCount}</span></span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${rule.enabled ? 'bg-emerald-950/60 text-emerald-400' : 'bg-[#27272A] text-[#71717A]'}`}>
                      {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: ML PIPELINE ===== */}
      {activeTab === 'ml-pipeline' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                ML Model Registry
              </h3>
              <span className="text-[10px] font-mono text-[#71717A]">{models.length} model(s)</span>
            </div>

            {models.length === 0 ? (
              <p className="text-xs text-[#71717A] font-mono">No models registered.</p>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="p-4 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white">{model.name}</div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#71717A]">
                          <span>v{model.version}</span>
                          <span className="capitalize">{model.type}</span>
                          <span>{model.framework}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        model.status === 'deployed'
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : model.status === 'trained'
                          ? 'bg-sky-950/60 text-sky-400'
                          : 'bg-[#27272A] text-[#71717A]'
                      }`}
                    >
                      {model.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: GOVERNANCE ===== */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Policies */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                Governance Policies
              </h3>
              <span className="text-[10px] font-mono text-[#71717A]">{policies.length} policy(ies)</span>
            </div>
            <div className="space-y-2">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="p-3 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{policy.name}</div>
                    <p className="text-[10px] text-[#71717A]">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold ${severityColor(policy.severity)}`}>
                      {policy.severity.toUpperCase()}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${policy.enabled ? 'bg-emerald-400' : 'bg-[#52525B]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Audit Log */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#3ECF8E]" />
              Full Audit Log
            </h3>
            {auditLog.length === 0 ? (
              <p className="text-xs text-[#71717A] font-mono">No audit entries yet.</p>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {[...auditLog].reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className={decisionColor(entry.decision)}>
                        {entry.decision === 'approved' ? '✅' : entry.decision === 'rejected' ? '❌' : '⚠️'}
                      </span>
                      <span className="text-white">{entry.action}</span>
                      <span className="text-[#71717A]">→ {entry.modelId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.policyViolations.length > 0 && (
                        <span className="text-amber-400">{entry.policyViolations.length} violation(s)</span>
                      )}
                      <span className="text-[#52525B]">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: COLLABORATION */}
      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          {/* Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Sessions', value: collabMetrics?.totalSessions ?? 0, color: 'text-sky-400' },
              { label: 'Active Users', value: collabMetrics?.activeUsers ?? 0, color: 'text-emerald-400' },
              { label: 'Comments', value: collabMetrics?.totalComments ?? 0, color: 'text-violet-400' },
              { label: 'Open Tasks', value: collabMetrics?.openTasks ?? 0, color: 'text-amber-400' },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div className={`text-xl font-bold font-display ${m.color}`}>{m.value}</div>
                <div className="text-[10px] font-mono text-[#71717A] uppercase">{m.label}</div>
              </div>
            ))}
          </div>

          {/* AI Agents */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                AI Collaboration Agents
              </h3>
              <button
                onClick={() => refresh({ action: 'collab-agents' })}
                className="text-[10px] font-mono text-[#71717A] hover:text-white transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(collabAgents || []).map((agent: { id: string; name: string; role: string; persona: string; isActive: boolean }) => (
                <div key={agent.id} className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{agent.name}</span>
                    <span className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-emerald-400' : 'bg-[#52525B]'}`} />
                  </div>
                  <p className="text-[10px] text-[#71717A] mb-2">{agent.persona}</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.expertise?.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#27272A] text-[#A1A1AA]">{tag}</span>
                    )) || null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create session */}
          <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Start Collaboration Session
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Session name..."
                value={collabSessionName}
                onChange={(e) => setCollabSessionName(e.target.value)}
                className="flex-1 bg-[#121214] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleCreateSession}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>

          {/* Current session */}
          {currentSession && (
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-display text-white">Active Session: {currentSession.name}</h3>
                <span className="text-[10px] font-mono text-[#3ECF8E]">{currentSession.users.length} user(s)</span>
              </div>
              {/* Participants */}
              <div className="flex flex-wrap gap-2">
                {currentSession.users.map((u: { id: string; name: string; role: string; isOnline: boolean }) => (
                  <span key={u.id} className="text-xs px-2 py-1 rounded-full bg-[#27272A] text-[#A1A1AA] border border-[#3A3A3D]">
                    {u.name} <span className="text-[#52525B]">({u.role})</span>
                    <span className={`ml-1 inline-block w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-emerald-400' : 'bg-[#52525B]'}`} />
                  </span>
                ))}
              </div>
              {/* Tasks summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-[#121214] text-center">
                  <div className="text-sm font-bold text-white">{currentSession.tasks?.filter((t: { status: string }) => t.status === 'open').length ?? 0}</div>
                  <div className="text-[9px] font-mono text-[#71717A]">Open</div>
                </div>
                <div className="p-2 rounded bg-[#121214] text-center">
                  <div className="text-sm font-bold text-white">{currentSession.tasks?.filter((t: { status: string }) => t.status === 'in_progress').length ?? 0}</div>
                  <div className="text-[9px] font-mono text-[#71717A]">In Progress</div>
                </div>
                <div className="p-2 rounded bg-[#121214] text-center">
                  <div className="text-sm font-bold text-white">{currentSession.tasks?.filter((t: { status: string }) => t.status === 'completed').length ?? 0}</div>
                  <div className="text-[9px] font-mono text-[#71717A]">Done</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="text-[10px] font-mono text-[#52525B] flex items-center justify-between border-t border-[#27272A] pt-3">
        <span>Phase 3 AI Platform v1.0.0 — Heuristic ML engine (swap to real models in production)</span>
        <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
