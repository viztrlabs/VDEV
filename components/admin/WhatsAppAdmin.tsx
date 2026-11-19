'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Phone,
  ChevronRight,
  Search,
  Send,
  Loader2,
  Dot,
} from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  metadata?: any;
}

interface WhatsAppConversation {
  id: string;
  provider: string;
  client_name: string;
  client_phone: string;
  external_id: string;
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  assigned_to: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

interface WhatsAppAdminProps {
  className?: string;
}

function formatTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

function convInitial(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

function statusBadgeClass(status: string) {
  const styles: Record<string, string> = {
    open: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/40',
    assigned: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
    closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/40',
  };
  return styles[status] || styles.open;
}

export default function WhatsAppAdmin({ className }: WhatsAppAdminProps) {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const params = new URLSearchParams();
      params.set('provider', 'whatsapp');
      params.set('pageSize', '50');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/whatsapp/conversations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load conversations');
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages');
    }
  };

  // Send a reply message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/whatsapp/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage.trim(), sender: 'agent' }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage('');
      setSending(false);

      // Update conversation last message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation!.id
            ? {
                ...c,
                last_message: newMessage.trim(),
                last_message_at: new Date().toISOString(),
                unread_count: 0,
              }
            : c
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
      setSending(false);
    }
  };

  // Update conversation status
  const updateConversationStatus = async (
    status: 'open' | 'assigned' | 'resolved' | 'closed'
  ) => {
    if (!selectedConversation) return;
    try {
      const res = await fetch(`/api/whatsapp/conversations/${selectedConversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setSelectedConversation((prev) => (prev ? { ...prev, status } : null));
      fetchConversations();
    } catch (err: any) {
      setError(err?.message || 'Failed to update status');
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [statusFilter, searchQuery]);

  // Select conversation
  const selectConversation = (conv: WhatsAppConversation) => {
    setSelectedConversation(conv);
    setMessages([]);
    fetchMessages(conv.id);
  };

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_phone.includes(searchQuery) ||
      c.external_id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* HEADER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#121214] to-[#09090B] border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase tracking-wider">
            <Phone className="w-4 h-4" />
            <span>CORE SYSTEM 07 • WHATSAPP SUPPORT</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">WhatsApp Support</h2>
          <p className="text-xs text-[#A1A1AA]">
            Manage WhatsApp conversations from {selectedConversation?.client_name || 'customers'}. Replies are delivered via the VizTR WhatsApp Bot (FEI-XMD).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
            unreadTotal > 0 ? 'bg-rose-500 text-white' : 'bg-[#3ECF8E] text-black'
          }`}>
            {unreadTotal > 0 ? `${unreadTotal} Unread` : 'All Clear'}
          </span>
          <button
            type="button"
            onClick={fetchConversations}
            className="px-3 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/60 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)]">
        {/* LEFT: Conversation List */}
        <div className="flex-1 min-w-[320px] flex flex-col">
          <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col h-full">
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client name or phone..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-[#71717A]">
                  <MessageSquare className="w-8 h-8 mx-auto text-[#4B5563] mb-2" />
                  <p className="text-sm text-[#A1A1AA]">No WhatsApp conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedConversation?.id === conv.id
                        ? 'bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 text-white'
                        : 'bg-[#09090B] border border-[#27272A]/50 text-zinc-300 hover:bg-[#27272A]/50 hover:text-white'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold font-display text-white truncate">{conv.client_name}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${statusBadgeClass(conv.status)}`}>
                          {conv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#4B5563] font-mono truncate">{conv.client_phone}</span>
                        {conv.unread_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-[10px] text-white font-bold">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#71717A] truncate mt-1">{conv.last_message || 'No messages yet'}</p>
                      <span className="text-[10px] text-[#4B5563] font-mono">{formatTime(conv.last_message_at)}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-[#71717A]" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Chat Window */}
        <div className="flex-1 min-w-[400px] flex flex-col h-full">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Phone className="w-16 h-16 text-[#4B5563]" />
                <h3 className="text-xl font-bold font-display text-white">Select a conversation</h3>
                <p className="text-xs text-[#71717A] max-w-xs mx-auto">
                  Click on a WhatsApp conversation from the list to view and reply to messages.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 rounded-t-2xl bg-[#18181B] border-b border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold text-sm">
                    {convInitial(selectedConversation.client_name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold font-display text-white">{selectedConversation.client_name}</div>
                    <div className="flex items-center gap-1 text-xs text-[#4B5563]">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        selectedConversation.status === 'open' ? 'bg-[#3ECF8E]' : 'bg-zinc-500'
                      }`} />
                      <span>{selectedConversation.status}</span>
                      <span>{selectedConversation.client_phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateConversationStatus('open')}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      selectedConversation.status === 'open'
                        ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border-[#3ECF8E]/40'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'
                    }`}
                    title="Mark Open"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConversationStatus('assigned')}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      selectedConversation.status === 'assigned'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'
                    }`}
                    title="Assign"
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConversationStatus('resolved')}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      selectedConversation.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'
                    }`}
                    title="Resolve"
                  >
                    Resolve
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#09090B]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#71717A] text-xs font-mono">
                    <MessageSquare className="w-6 h-6 mb-2 opacity-50" />
                    <p>No messages yet. Send your first reply below.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                            msg.sender === 'user'
                              ? 'bg-[#25D366] text-black rounded-tr-none'
                              : 'bg-[#18181B] border border-[#27272A] text-zinc-300 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className={`text-[9px] mt-1 block ${
                            msg.sender === 'agent' ? 'text-black/60' : 'text-zinc-500'
                          }`}>
                            {formatTime(msg.created_at)}
                            {msg.sender === 'agent' && `  •  ${msg.status}`}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[#27272A] bg-[#18181B]">
                <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    disabled={sending}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded-full px-4 py-2.5 pr-12 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="absolute right-2.5 w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1eb758] flex items-center justify-center text-black transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>
                {error && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-950/80 border border-rose-700/60 text-red-300 text-[10px] font-mono">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
