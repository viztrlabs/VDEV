'use client';

import React, { useState, useCallback } from 'react';
import { Send, X, Minimize2, Maximize2, Bot } from 'lucide-react';

interface HermesChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HermesButtonProps {
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';
  } | null;
}

export const HermesButton: React.FC<HermesButtonProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<HermesChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I am Hermes, your AI assistant. How can I help you with VizTR today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const userMsg: HermesChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          message: inputValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: HermesChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: HermesChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      setIsApiAvailable(false);
      const assistantMsg: HermesChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. I am running in simulation mode - your messages are being echoed back.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, user?.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 shadow-lg hover:shadow-[#3ECF8E]/30 transition-all duration-300 flex items-center justify-center z-50 group"
        title="Hermes AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-black" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#09090B] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#3ECF8E] rounded-full animate-pulse" />
          </div>
        </div>
        <span className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Hermes AI
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized ? 'w-14 h-14' : 'w-80 sm:w-96'
      }`}
    >
      <div className="w-full h-full bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl shadow-black/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#27272A] bg-[#09090B] rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#3ECF8E]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Hermes AI Assistant
                <span
                  className={`text-[10px] ${isApiAvailable ? 'text-[#3ECF8E]' : 'text-[#71717A]'}`}
                >
                  {isApiAvailable ? '●' : '○'}
                </span>
              </div>
              <div className="text-[9px] text-[#71717A]">
                {user ? `${user.name || user.email}` : 'AI Assistant'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-xs font-mono ${
                      msg.role === 'user'
                        ? 'bg-[#3ECF8E]/20 text-white border border-[#3ECF8E]/40'
                        : 'bg-[#09090B] text-[#E4E4E7] border border-[#27272A]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-3 py-2 rounded-lg text-xs font-mono bg-[#09090B] text-[#E4E4E7] border border-[#27272A]">
                    Hermes is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-2 border-t border-[#27272A]">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isApiAvailable ? "Ask Hermes..." : "Simulation mode - ask anything"}
                  className="flex-1 px-2.5 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isSending}
                  className="p-1.5 rounded-lg bg-[#3ECF8E] text-black hover:bg-[#3ECF8E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HermesButton;
