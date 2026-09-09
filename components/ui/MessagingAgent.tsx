'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Send, Bot } from 'lucide-react';

export function MessagingAgent() {
  const { isAgentClosed, setAgentClosed } = useAppStore();
  const [message, setMessage] = useState('');

  if (isAgentClosed) {
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
          </div>
        </div>
        <button
          onClick={() => setAgentClosed(true)}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close Messaging Agent"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area (Placeholder) */}
      <div className="flex-1 min-h-[250px] p-4 flex flex-col gap-3 overflow-y-auto">
        <div className="self-start max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-sm text-zinc-300">
            Hello! I am the VIZTR Messaging Agent. How can I assist you with your architectural visualization needs today?
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && message.trim()) {
                setMessage('');
                // Add message logic here in the future
              }
            }}
          />
          <button
            className="absolute right-1.5 w-8 h-8 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] flex items-center justify-center text-black transition-colors disabled:opacity-50 disabled:hover:bg-[#00F0FF]"
            onClick={() => setMessage('')}
            disabled={!message.trim()}
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
