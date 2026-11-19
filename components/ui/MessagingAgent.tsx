'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { X, Send, Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
}

interface MessagingAgentProps {
  hidden?: boolean;
}

export function MessagingAgent({ hidden = false }: MessagingAgentProps) {
  const pathname = usePathname();
  const { user, isAgentClosed, setAgentClosed } = useAppStore();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [whatsappPhone, setWhatsAppPhone] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPathHidden =
    pathname.startsWith('/explore') ||
    pathname.startsWith('/experience') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/virtual-tour') ||
    pathname.startsWith('/xr-world/virtual-tour/tour-builder') ||
    pathname.startsWith('/xr-world/virtual-tour/editor');

  const isHidden = hidden || isAgentClosed || isPathHidden;

  // Initialize conversation from localStorage or create new one on first send
  useEffect(() => {
    const stored = localStorage.getItem('viztr_chat_conversation_id');
    if (stored) {
      setConversationId(stored);
      loadMessages(stored);
    }
    setInitialized(true);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load WhatsApp phone number from settings or env var
  useEffect(() => {
    const loadWhatsAppPhone = async () => {
      // Try env var first
      if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_PHONE) {
        setWhatsAppPhone(process.env.NEXT_PUBLIC_WHATSAPP_PHONE);
        return;
      }
      // Try settings API
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const phoneSetting = data.settings?.find((s: any) => s.key === 'WHATSAPP_PHONE_NUMBER' || s.key === 'WHATSAPP_PHONE');
        if (phoneSetting?.value) {
          setWhatsAppPhone(phoneSetting.value);
        }
      } catch {
        // Silent fail
      }
    };
    loadWhatsAppPhone();
  }, []);

  const loadMessages = useCallback(async (cid: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${cid}&limit=100`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            sender: m.sender,
            text: m.text,
            status: m.status,
            createdAt: m.created_at,
          }))
        );
      }
    } catch {
      // Silent fail — messages will be empty
    }
  }, []);

  const createConversation = useCallback(async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '',
          sender: 'user',
          provider: 'web',
          clientName: user?.name || undefined,
          clientEmail: user?.email || undefined,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.success && data.conversationId) {
        localStorage.setItem('viztr_chat_conversation_id', data.conversationId);
        setConversationId(data.conversationId);
        return data.conversationId;
      }
    } catch {
      // Silent fail
    }
    return null;
  }, [user]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setSending(true);
    setError(null);

    const optimisticMessage: ChatMessage = {
      id: `opt_${Date.now()}`,
      conversationId: conversationId || '',
      sender: 'user',
      text: userMessage,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    let cid = conversationId;
    if (!cid) {
      cid = await createConversation();
      if (!cid) {
        setSending(false);
        setError('Unable to start conversation. Please try again.');
        return;
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: cid,
          text: userMessage,
          sender: 'user',
          provider: 'web',
          clientName: user?.name || undefined,
          clientEmail: user?.email || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id
              ? {
                  ...m,
                  id: data.message.id,
                  status: data.message.status,
                  createdAt: data.message.createdAt,
                }
              : m
          )
        );
        setConversationId(data.conversationId);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [message, conversationId, user, createConversation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && message.trim()) {
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!whatsappPhone) return;
    const welcomeMsg = 'Hello! I would like to inquire about VizTR architectural visualization services.';
    const encodedMessage = encodeURIComponent(welcomeMsg);
    const phone = whatsappPhone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden bg-[#0A0A0B]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#00F0FF]/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide">VIZTR Agent</span>
            <span className="text-[10px] text-[#42CF8B] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse" />
              Online
            </span>
            {whatsappPhone && (
              <span className="text-[10px] text-[#25D366] font-mono flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                WhatsApp
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleOpenWhatsApp}
          disabled={!whatsappPhone}
          className={`p-2 rounded-full ${whatsappPhone ? 'bg-[#25D366] hover:bg-[#1eb758] text-black transition-colors' : 'text-zinc-400 hover:text-white hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed'}`}
          aria-label="Chat on WhatsApp"
          title={whatsappPhone ? 'Chat with us on WhatsApp' : 'WhatsApp not configured'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#25D366"
            xmlns="http://www.w3.org/2000/svg"
            className={!whatsappPhone ? 'opacity-50' : ''}
          >
            <path d="M23.45 5.69c-.31-.31-.62-.59-1-.85C21.23 4 20.69 3.55 20.17 3.24c-.87-.5-1.76-.83-2.64-.83h-4c-3.42 0-6.41 1.8-8.19 4.82-.65 1.11-.96 2.28-.96 3.43 0 2.84 2.23 5.27 5.15 5.84.39.07.79.14 1.17.19h.02c2.31.43 4.33-1.29 5.08-3.35 1.2-3.28-.33-6.6-3.07-8.55l-.01-.01c-2.6-1.83-5.75-1.36-7.91.67-.94.87-1.43 1.87-1.43 2.91v.06c0 1.18.4 2.34 1.19 3.22.91 1.02 2.04 1.78 3.3 2.23l.01.01c.24.08.47.15.71.21C5.12 20.63 4.83 21 4.52 21c-.15 0-.3-.04-.44-.1l-.01-.01c-.46-.2-.82-.62-1.07-1.13-.4-.85-.57-1.78-.43-2.73.05-.34.15-.67.28-.98l.01-.01c.12-.3.25-.59.4-.86.34-.63.7-1.24 1.1-1.81 1.3-1.84 3.02-3.33 4.83-4.41l.01-.01c.62-.36 1.23-.7 1.81-1 .95-.51 1.85-1 2.72-1.42l.01-.01c1.56-.75 3.07-1.46 4.46-2.16l.02-.01c1.11-.56 2.12-1.11 3.01-1.64l.01-.01c1.7-1.02 3.23-2.01 4.51-3.14l.02-.02c1.19-1.06 2.19-2.22 2.95-3.48.48-.8.83-1.65.99-2.54.12-.68.17-1.37.12-2.08-.02-.36-.07-.73-.14-1.09z" />
          </svg>
        </button>
        <button
          onClick={() => setAgentClosed(true)}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close Messaging Agent"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-[250px] p-4 flex flex-col gap-3 overflow-y-auto">
        {!initialized ? (
          <div className="self-center py-4 text-xs text-zinc-500">Initializing...</div>
        ) : messages.length === 0 ? (
          <div className="self-start max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-sm text-zinc-300">
              Hello! I am the VIZTR Messaging Agent. How can I assist you with your architectural visualization needs today?
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'user'
                    ? 'self-end bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-white rounded-br-sm'
                    : 'self-start bg-white/5 border border-white/10 text-zinc-300 rounded-bl-sm'
                }`}
              >
                <p className={msg.sender === 'user' ? 'text-white' : 'text-zinc-300'}>
                  {msg.text}
                </p>
                <span
                  className={`text-[10px] mt-1 opacity-60 block ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.status === 'failed' ? '⚠️ Failed' : msg.status === 'sent' ? 'Sent' : 'Delivered'}
                </span>
              </div>
            ))}
            {sending && (
              <div className="self-start max-w-[32%] bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-[#00F0FF]" />
                <span className="text-xs text-zinc-400">Typing...</span>
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
            placeholder="Type your message..."
            disabled={sending || !initialized}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors disabled:opacity-50"
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending || !initialized}
            className="absolute right-1.5 w-8 h-8 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] flex items-center justify-center text-black transition-colors disabled:opacity-50 disabled:hover:bg-[#00F0FF]"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
