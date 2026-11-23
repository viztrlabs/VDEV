'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { X, Send, Bot, Loader2, UserRound, ShieldCheck } from 'lucide-react';
import { useRealtime } from '@/lib/useRealtime';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

const SESSION_KEY = 'viztr_chat_session_id';

function makeSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `VTR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeMessage(raw: any): ChatMessage {
  return {
    id: String(raw.id),
    conversationId: String(raw.conversationId || raw.conversation_id || ''),
    sender: raw.sender,
    text: String(raw.text || ''),
    status: raw.status || 'sent',
    createdAt: String(raw.createdAt || raw.created_at || new Date().toISOString()),
    metadata: raw.metadata || null,
  };
}

interface MessagingAgentProps {
  hidden?: boolean;
}

export function MessagingAgent({ hidden = false }: MessagingAgentProps) {
  const pathname = usePathname();
  const { user, isAgentClosed, setAgentClosed } = useAppStore();
  const [sessionId, setSessionId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<'ai' | 'human'>('ai');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [leadPrompt, setLeadPrompt] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSaving, setLeadSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const sessionRef = useRef<string>('');

  const isPathHidden =
    pathname.startsWith('/explore') ||
    pathname.startsWith('/experience') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/virtual-tour') ||
    pathname.startsWith('/xr-world/virtual-tour/tour-builder') ||
    pathname.startsWith('/xr-world/virtual-tour/editor');

  const isHidden = hidden || isAgentClosed || isPathHidden || !chatEnabled;

  const mergeMessages = useCallback((incoming: any[]) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    const normalized = incoming.map(normalizeMessage).filter((m) => m.id && !m.id.startsWith('opt_'));
    const fresh = normalized.filter((m) => !knownIds.current.has(m.id));
    if (fresh.length === 0) return;
    fresh.forEach((m) => knownIds.current.add(m.id));
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m] as const));
      for (const m of fresh) byId.set(m.id, m);
      return Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }, []);

  const loadMessages = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sid)}&limit=100`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setConversationId(data.conversationId);
        setMode(data.mode === 'human' ? 'human' : 'ai');
        mergeMessages(data.messages);
      }
    } catch {
      // Silent fail — polling and realtime will retry.
    }
  }, [mergeMessages]);

  // ---------- Session bootstrap (no message required) ----------
  useEffect(() => {
    let stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      stored = makeSessionId();
      localStorage.setItem(SESSION_KEY, stored);
    }
    sessionRef.current = stored;
    setSessionId(stored);

    // Non-sensitive runtime flags from the Admin CMS.
    fetch('/api/chat/config', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.chatEnabled === 'boolean') setChatEnabled(data.chatEnabled);
        if (typeof data?.chatAiEnabled === 'boolean') setAiEnabled(data.chatAiEnabled);
      })
      .catch(() => {});

    (async () => {
      try {
        const res = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: stored,
            clientName: user?.name || undefined,
            clientEmail: user?.email || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setConversationId(data.conversationId);
          setMode(data.mode === 'human' ? 'human' : 'ai');
          if (data.mode === 'human') setLeadPrompt(true);
        }
      } catch {
        // Non-fatal: the first message still creates the conversation.
      } finally {
        await loadMessages(stored!);
        setInitialized(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Realtime delivery ----------
  // postgres_changes (approved path; works for signed-in visitors).
  useRealtime(
    'messages',
    (payload: any) => {
      if (conversationId && payload?.new?.conversation_id !== conversationId) return;
      if (payload?.new) mergeMessages([payload.new]);
    },
    'INSERT',
    conversationId ? `conversation_id=eq.${conversationId}` : undefined,
  );

  // Broadcast channel (works for anonymous visitors, whom RLS blocks above)
  // plus a 4-second API polling fallback for reliability.
  useEffect(() => {
    const sid = sessionRef.current;
    if (!sid) return;

    let channel: any = null;
    if (supabase && conversationId) {
      channel = supabase
        .channel(`chat:${conversationId}`)
        .on('broadcast', { event: 'message' }, (payload: any) => {
          if (payload?.payload) mergeMessages([payload.payload]);
        })
        .subscribe();
    }

    const poll = async () => {
      await loadMessages(sid);
    };
    const timer = setInterval(poll, 4000);

    return () => {
      if (channel && supabase) {
        try { void supabase.removeChannel(channel); } catch { /* ignore */ }
      }
      clearInterval(timer);
    };
  }, [conversationId, loadMessages, mergeMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, leadPrompt]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setSending(true);
    setError(null);

    const optimisticId = `opt_${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      conversationId: conversationId || '',
      sender: 'user',
      text: userMessage,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          text: userMessage,
          sender: 'user',
          provider: 'web',
          clientName: user?.name || undefined,
          clientEmail: user?.email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to send message');
      }

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.mode) setMode(data.mode);
      if (data.handoff?.ok) setLeadPrompt(true);

      // Replace the optimistic bubble with the persisted one.
      if (data.message) {
        const persisted = normalizeMessage(data.message);
        knownIds.current.add(persisted.id);
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? persisted : m)));
      }
      mergeMessages(data.messages || []);
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [message, conversationId, user, mergeMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && message.trim()) {
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const handleRequestSpecialist = async () => {
    if (escalating || mode === 'human') return;
    setEscalating(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionRef.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Could not connect you to a specialist');
      setMode('human');
      setLeadPrompt(true);
      await loadMessages(sessionRef.current);
    } catch (err: any) {
      setError(err?.message || 'Could not connect you to a specialist.');
    } finally {
      setEscalating(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() && !leadEmail.trim()) return;
    setLeadSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          clientName: leadName.trim(),
          clientEmail: leadEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Could not save your details');
      setLeadPrompt(false);
      await loadMessages(sessionRef.current);
    } catch (err: any) {
      setError(err?.message || 'Could not save your details.');
    } finally {
      setLeadSaving(false);
    }
  };

  if (isHidden) return null;

  const humanMode = mode === 'human';

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden bg-[#131314]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#00F0FF]/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
            {humanMode ? <UserRound className="w-4 h-4 text-[#54de99]" /> : <Bot className="w-4 h-4 text-[#00F0FF]" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide">VIZTR Agent</span>
            <span className={`text-[10px] font-mono flex items-center gap-1 ${humanMode ? 'text-amber-300' : 'text-[#54de99]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${humanMode ? 'bg-amber-300' : 'bg-[#54de99]'}`} />
              {humanMode ? 'Specialist connected' : aiEnabled ? 'AI assistant · Online' : 'AI auto-reply paused'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!humanMode && (
            <button
              type="button"
              onClick={handleRequestSpecialist}
              disabled={escalating}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              title="Connect with a VizTR specialist"
            >
              {escalating ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              Talk to specialist
            </button>
          )}
          <button
            onClick={() => setAgentClosed(true)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Messaging Agent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-[250px] max-h-[420px] p-4 flex flex-col gap-3 overflow-y-auto">
        {!initialized ? (
          <div className="self-center py-4 text-xs text-zinc-500">Initializing…</div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="self-start max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
                <p className="text-sm text-zinc-300">
                  Hello! I am the VIZTR Agent. How can I help with your architectural visualization, 360° tour or WebXR project today?
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isSystem = Boolean(msg.metadata?.system || msg.metadata?.lead);
              if (isSystem) {
                return (
                  <div key={msg.id} className="self-center max-w-[92%] text-center">
                    <p className="text-[10px] font-mono text-[#54de99]/90 bg-[#54de99]/5 border border-[#54de99]/15 rounded-full px-3 py-1">
                      {msg.text}
                    </p>
                  </div>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === 'user'
                      ? 'self-end bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-white rounded-br-sm'
                      : msg.sender === 'agent'
                        ? 'self-start bg-[#54de99]/10 border border-[#54de99]/25 text-zinc-200 rounded-bl-sm'
                        : 'self-start bg-white/5 border border-white/10 text-zinc-300 rounded-bl-sm'
                  }`}
                >
                  {msg.sender !== 'user' && (
                    <span className="block text-[9px] font-mono uppercase tracking-wider opacity-60 mb-1">
                      {msg.sender === 'agent' ? 'VizTR Specialist' : 'VizTR AI'}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <span className={`text-[10px] mt-1 opacity-60 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.status === 'failed' ? 'Failed' : 'Delivered'}
                  </span>
                </div>
              );
            })}

            {leadPrompt && (
              <form onSubmit={handleLeadSubmit} className="self-start w-full bg-[#54de99]/5 border border-[#54de99]/20 rounded-xl p-3 space-y-2">
                <p className="text-[11px] text-zinc-300 font-mono">
                  A specialist is joining. Leave your details so they can help faster.
                </p>
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#54de99]/50"
                />
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#54de99]/50"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={leadSaving || (!leadName.trim() && !leadEmail.trim())}
                    className="flex-1 py-1.5 rounded-lg bg-[#54de99] text-black text-[11px] font-bold font-mono disabled:opacity-50"
                  >
                    {leadSaving ? 'Saving…' : 'Send details'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadPrompt(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[11px] font-mono"
                  >
                    Skip
                  </button>
                </div>
              </form>
            )}

            {(sending || humanMode) && (
              <div className="self-start max-w-[60%] bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-[#00F0FF]" />
                <span className="text-xs text-zinc-400">
                  {sending ? 'Typing…' : 'Waiting for a specialist…'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div className="self-start max-w-[85%] bg-red-900/20 border border-red-500/30 rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={humanMode ? 'Message your specialist…' : 'Type your message…'}
            disabled={sending || !initialized}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors disabled:opacity-50"
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending || !initialized}
            className="absolute right-1.5 w-8 h-8 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] flex items-center justify-center text-black transition-colors disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
