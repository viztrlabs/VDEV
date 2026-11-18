'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KnowledgeChunk {
  id: string;
  source: 'page' | 'blog' | 'service' | 'project' | 'manual';
  sourceId: string;
  title: string;
  url: string;
  content: string;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface EscalationTicket {
  id: string;
  userId: string;
  provider: 'telegram' | 'web';
  conversationId: string;
  question: string;
  context: string;
  status: 'pending' | 'assigned' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

interface KnowledgeState {
  chunks: KnowledgeChunk[];
  tickets: EscalationTicket[];
  addChunk: (chunk: Omit<KnowledgeChunk, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChunk: (id: string, data: Partial<KnowledgeChunk>) => void;
  deleteChunk: (id: string) => void;
  searchChunks: (query: string, limit?: number) => KnowledgeChunk[];
  createTicket: (ticket: Omit<EscalationTicket, 'id' | 'createdAt' | 'updatedAt'>) => EscalationTicket;
  updateTicket: (id: string, data: Partial<EscalationTicket>) => void;
  getPendingTickets: () => EscalationTicket[];
}

const DEFAULT_CHUNKS: KnowledgeChunk[] = [];

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      chunks: DEFAULT_CHUNKS,
      tickets: [],

      addChunk: (chunk) =>
        set((state) => ({
          chunks: [
            ...state.chunks,
            {
              ...chunk,
              id: `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateChunk: (id, data) =>
        set((state) => ({
          chunks: state.chunks.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteChunk: (id) =>
        set((state) => ({
          chunks: state.chunks.filter((c) => c.id !== id),
        })),

      searchChunks: (query, limit = 5) => {
        const { chunks } = get();
        const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
        if (!terms.length) return [];

        return chunks
          .map((chunk) => {
            const haystack = `${chunk.title} ${chunk.content}`.toLowerCase();
            let score = 0;
            for (const term of terms) {
              const matches = (haystack.match(new RegExp(term, 'g')) || []).length;
              score += matches;
            }
            return { chunk, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((x) => x.chunk);
      },

      createTicket: (ticket) => {
        const newTicket: EscalationTicket = {
          ...ticket,
          id: `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tickets: [...state.tickets, newTicket] }));
        return newTicket;
      },

      updateTicket: (id, data) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        })),

      getPendingTickets: () =>
        get().tickets.filter((t) => t.status === 'pending' || t.status === 'assigned'),
    }),
    { name: 'viztr-knowledge' }
  )
);