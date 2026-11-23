'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  User,
  Clock,
  RefreshCw,
  Filter,
  X,
} from 'lucide-react';
import { useKnowledgeStore, type KnowledgeChunk, type EscalationTicket } from '@/lib/knowledge-store';

export default function KnowledgeManager() {
  const { chunks, tickets, addChunk, updateChunk, deleteChunk, searchChunks, updateTicket, getPendingTickets } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState<'knowledge' | 'tickets'>('knowledge');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChunk, setEditingChunk] = useState<KnowledgeChunk | null>(null);
  const [newChunk, setNewChunk] = useState<Omit<KnowledgeChunk, 'id' | 'createdAt' | 'updatedAt'>>({
    source: 'page',
    sourceId: '',
    title: '',
    url: '',
    content: '',
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'assigned' | 'resolved'>('all');

  const filteredChunks = searchQuery ? searchChunks(searchQuery) : chunks;
  const filteredTickets = filterStatus === 'all' ? tickets : tickets.filter(t => t.status === filterStatus);
  const pendingCount = tickets.filter(t => t.status === 'pending').length;

  const handleAddChunk = (e: React.FormEvent) => {
    e.preventDefault();
    addChunk(newChunk);
    setNewChunk({ source: 'page', sourceId: '', title: '', url: '', content: '' });
    setShowAddModal(false);
  };

  const handleUpdateChunk = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChunk) {
      updateChunk(editingChunk.id, { ...editingChunk, updatedAt: new Date().toISOString() });
      setEditingChunk(null);
    }
  };

  const handleTicketAction = (ticket: EscalationTicket, action: 'assign' | 'resolve' | 'close') => {
    const statusMap = { assign: 'assigned', resolve: 'resolved', close: 'closed' } as const;
    updateTicket(ticket.id, { status: statusMap[action], assignedTo: action === 'assign' ? 'Current Operator' : ticket.assignedTo });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#201f20] via-[#131314] to-[#131314] border border-[#353436] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#dbfcff] font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>CORE SYSTEM 06 • KNOWLEDGE BASE & ESCALATIONS</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Knowledge Manager
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Manage website content for RAG-powered answers and handle escalated tickets from Telegram/Web.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[#dbfcff] hover:bg-[#34b27b] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#201f20] border border-[#353436]">
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all ${
            activeTab === 'knowledge'
              ? 'bg-[#dbfcff] text-black'
              : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" /> Knowledge Base ({chunks.length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all relative ${
            activeTab === 'tickets'
              ? 'bg-[#dbfcff] text-black'
              : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-1" /> Escalations
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-mono flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* KNOWLEDGE TAB */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChunks.length === 0 ? (
              <div className="col-span-full p-8 text-center text-[#71717A]">
                {searchQuery ? 'No matching content found' : 'Knowledge base is empty. Add content to enable RAG answers.'}
              </div>
            ) : (
              filteredChunks.map((chunk) => (
                <div key={chunk.id} className="p-4 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#dbfcff]/20 text-[#dbfcff] border border-[#dbfcff]/40">
                        {chunk.source}
                      </span>
                      <h4 className="text-sm font-bold text-white font-display truncate max-w-[200px]">{chunk.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingChunk(chunk)} className="p-1.5 rounded hover:bg-[#353436] text-[#A1A1AA] hover:text-white transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteChunk(chunk.id)} className="p-1.5 rounded hover:bg-[#353436] text-[#A1A1AA] hover:text-rose-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#71717A] line-clamp-3">{chunk.content}</p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-[#71717A]">
                    <span>Source: <a href={chunk.url} target="_blank" rel="noopener noreferrer" className="text-[#dbfcff] hover:underline">{chunk.url}</a></span>
                    <span>Updated: {new Date(chunk.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white focus:outline-none focus:border-[#dbfcff]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-[#A1A1AA] hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-[#71717A]">No tickets found</div>
            ) : (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-2xl bg-[#201f20] border border-[#353436] space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        ticket.status === 'pending' ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60' :
                        ticket.status === 'assigned' ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' :
                        'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#dbfcff]/20 text-[#dbfcff] border border-[#dbfcff]/40">
                        {ticket.provider}
                      </span>
                    </div>
                    <div className="text-right text-[10px] text-[#71717A]">
                      <div>Ticket: <span className="font-mono text-white">{ticket.id}</span></div>
                      <div>{new Date(ticket.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-[#131314] border border-[#353436]">
                      <div className="font-bold text-white mb-1">Question:</div>
                      <div className="text-[#A1A1AA]">{ticket.question}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#131314] border border-[#353436]">
                      <div className="font-bold text-white mb-1">Context Searched:</div>
                      <div className="text-[#71717A]">{ticket.context || 'None'}</div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
                      <User className="w-3 h-3" /> User: <span className="text-white">{ticket.userId}</span>
                      <MessageSquare className="w-3 h-3" /> Conv: <span className="text-white">{ticket.conversationId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#353436]">
                    {ticket.status === 'pending' && (
                      <>
                        <button onClick={() => handleTicketAction(ticket, 'assign')} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors">
                          <User className="w-3.5 h-3.5" /> Assign to Me
                        </button>
                        <button onClick={() => handleTicketAction(ticket, 'resolve')} className="px-3 py-1.5 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                        </button>
                      </>
                    )}
                    {ticket.status === 'assigned' && (
                      <button onClick={() => handleTicketAction(ticket, 'resolve')} className="px-3 py-1.5 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}
                    {ticket.status === 'resolved' && (
                      <span className="text-xs font-mono text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        {ticket.resolution && <span className="ml-2 text-[9px] text-[#71717A]">Resolution logged</span>}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {(showAddModal || editingChunk) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#201f20] border border-[#353436] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-white">{editingChunk ? 'Edit Content' : 'Add Knowledge Chunk'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingChunk(null); }} className="p-2 rounded hover:bg-[#353436] text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={editingChunk ? handleUpdateChunk : handleAddChunk} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">Source Type</label>
                <select
                  value={editingChunk ? editingChunk.source : newChunk.source}
                  onChange={(e) => {
                    const val = e.target.value as KnowledgeChunk['source'];
                    editingChunk ? setEditingChunk({...editingChunk, source: val}) : setNewChunk({...newChunk, source: val});
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white focus:outline-none focus:border-[#dbfcff]"
                >
                  <option value="page">Page</option>
                  <option value="blog">Blog</option>
                  <option value="service">Service</option>
                  <option value="project">Project</option>
                  <option value="manual">Manual Entry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">Source ID / Route</label>
                <input
                  type="text"
                  value={editingChunk ? editingChunk.sourceId : newChunk.sourceId}
                  onChange={(e) => editingChunk ? setEditingChunk({...editingChunk, sourceId: e.target.value}) : setNewChunk({...newChunk, sourceId: e.target.value})}
                  placeholder="/services, /blog/post-slug, etc."
                  className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">Title</label>
                <input
                  type="text"
                  value={editingChunk ? editingChunk.title : newChunk.title}
                  onChange={(e) => editingChunk ? setEditingChunk({...editingChunk, title: e.target.value}) : setNewChunk({...newChunk, title: e.target.value})}
                  placeholder="Service: 8K Architectural CGI"
                  className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">URL</label>
                <input
                  type="url"
                  value={editingChunk ? editingChunk.url : newChunk.url}
                  onChange={(e) => editingChunk ? setEditingChunk({...editingChunk, url: e.target.value}) : setNewChunk({...newChunk, url: e.target.value})}
                  placeholder="https://viztr.io/services"
                  className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">Content</label>
                <textarea
                  value={editingChunk ? editingChunk.content : newChunk.content}
                  onChange={(e) => editingChunk ? setEditingChunk({...editingChunk, content: e.target.value}) : setNewChunk({...newChunk, content: e.target.value})}
                  rows={6}
                  placeholder="Paste the full content here. It will be auto-chunked for RAG search."
                  className="w-full px-3 py-2 rounded-lg bg-[#131314] border border-[#353436] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#dbfcff] resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#353436]">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingChunk(null); }} className="px-4 py-2 rounded-lg bg-[#131314] border border-[#353436] text-[#A1A1AA] hover:text-white text-xs font-mono">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#dbfcff] hover:bg-[#34b27b] text-black text-xs font-mono font-bold">{editingChunk ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}