'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KnowledgeChunk {
  id: string;
  source: 'page' | 'blog' | 'service' | 'project' | 'manual' | 'contact';
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

const DEFAULT_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'chunk_seed_001',
    source: 'service',
    sourceId: 'arch-viz',
    title: 'Architectural Visualization Services',
    url: '/services',
    content: 'VizTR Studio provides professional architectural visualization services including 3D exterior and interior renders, WebXR experiences, 360° virtual tours, and AI-generated marketing imagery for architecture firms. We work with residential, commercial, hospitality, and institutional projects. Contact us for a consultation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chunk_seed_002',
    source: 'service',
    sourceId: 'xr-world',
    title: 'XR World - WebXR & Virtual Tours',
    url: '/xr-world',
    content: 'VizTR XR World offers WebXR and WebAR experiences, 360° virtual tours, and immersive architectural presentations. Our virtual tours use Marzipano technology and our WebXR experiences run in browser without app downloads. Perfect for real estate previews, architectural walkthroughs, and interactive marketing.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chunk_seed_003',
    source: 'service',
    sourceId: 'booking',
    title: 'Book a Consultation',
    url: '/book',
    content: 'Book a free architectural visualization consultation with VizTR Studio. We discuss your project requirements, timeline, budget, and deliverables. Consultations are available for exterior renders, interior renders, 360° tours, WebXR experiences, and AI marketing imagery. Fill out the booking form on our website to schedule.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chunk_seed_004',
    source: 'contact',
    sourceId: 'contact-info',
    title: 'Contact VizTR Studio',
    url: '/contact',
    content: 'Contact VizTR Studio for architectural visualization services. Email us at admin@viztr.com or use the contact form on our website. We respond within 24 hours. For urgent inquiries, reach us on WhatsApp at +919336561591.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chunk_seed_005',
    source: 'project',
    sourceId: 'about',
    title: 'About VizTR Studio',
    url: '/about',
    content: 'VizTR Studio is an architecture visualization studio specializing in 3D renders, WebXR experiences, virtual tours, and AI-generated marketing. We serve architecture firms, real estate developers, and interior designers worldwide. Our mission is to make architectural visualization accessible, fast, and beautiful.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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