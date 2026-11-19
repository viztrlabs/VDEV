'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Smartphone, X, Send, MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  welcomeMessage?: string;
  label?: string;
}

export function WhatsAppButton({
  phoneNumber: propPhoneNumber,
  welcomeMessage: propWelcomeMessage = 'Hello! I would like to inquire about VizTR architectural visualization services.',
  label = 'Chat with us on WhatsApp',
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  // Resolve phone number: prop > env > default placeholder
  const phoneNumber =
    propPhoneNumber ||
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_PHONE
      ? process.env.NEXT_PUBLIC_WHATSAPP_PHONE
      : '');
  const hasPhoneNumber = Boolean(phoneNumber);

  const buildWhatsAppUrl = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    return hasPhoneNumber
      ? `https://wa.me/${phoneNumber.replace(/[^0-9+]/g, '')}?text=${encodedMessage}`
      : '';
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const url = buildWhatsAppUrl(inputMessage);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setInputMessage('');
    setIsOpen(false);
  };

  // Always render floating button; panel shows config hint if no phone number
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {/* Floating action button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1eb758] flex items-center justify-center shadow-2xl shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 border border-white/10"
      >
        <Smartphone className="w-7 h-7 text-white" />
      </button>

      {/* Chat panel (expanded) */}
      {isOpen && (
        <div className="w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden bg-[#0A0A0B]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#25D366]/10 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#25D366]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">VizTR Support</span>
                <span className="text-[10px] text-[#42CF8B] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#42CF8B] animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col min-h-[260px]">
            {!hasPhoneNumber ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Smartphone className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">WhatsApp not configured</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Please set NEXT_PUBLIC_WHATSAPP_PHONE environment variable or configure in admin settings.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-[#25D366] hover:text-[#25D366]/80 underline underline-offset-4"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  <div className="self-start max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
                    <p className="text-sm text-zinc-300">
                      Hello! I am VizTR support. How can I help you with your architectural visualization needs today?
                    </p>
                  </div>
                </div>

                {/* Input area */}
                <div className="p-3 border-t border-white/10 bg-black/20">
                  <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={hasPhoneNumber ? 'Type your message...' : ''}
                      disabled={!hasPhoneNumber}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#25D366]/50 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1eb758] flex items-center justify-center text-black transition-colors disabled:opacity-50 disabled:hover:bg-[#25D366]"
                      disabled={!hasPhoneNumber || !inputMessage.trim()}
                    >
                      <Send className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Direct WhatsApp link footer */}
          {hasPhoneNumber && (
            <div className="border-t border-white/10 p-3 bg-black/20">
              <Link
                href={buildWhatsAppUrl(propWelcomeMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2 text-xs font-medium text-[#25D366] hover:text-[#1eb758] transition-colors"
              >
                <span>Open in WhatsApp</span>
                <span className="text-[10px] font-mono opacity-60">{phoneNumber}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WhatsAppButton;
