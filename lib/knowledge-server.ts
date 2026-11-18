/**
 * Server-side knowledge functions (no zustand dependency)
 * Used by API routes for RAG and escalation
 */

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

// In-memory store for server (in production, use Redis/Postgres)
const serverChunks: KnowledgeChunk[] = [];
const serverTickets: EscalationTicket[] = [];

export function searchKnowledgeChunks(query: string, limit = 5): KnowledgeChunk[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return [];

  return serverChunks
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
}

export function createEscalationTicket(
  ticket: Omit<EscalationTicket, 'id' | 'createdAt' | 'updatedAt'>
): EscalationTicket {
  const newTicket: EscalationTicket = {
    ...ticket,
    id: `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  serverTickets.push(newTicket);
  return newTicket;
}

export function updateTicket(id: string, data: Partial<EscalationTicket>): void {
  const idx = serverTickets.findIndex((t) => t.id === id);
  if (idx >= 0) {
    serverTickets[idx] = { ...serverTickets[idx], ...data, updatedAt: new Date().toISOString() };
  }
}

export function getPendingTickets(): EscalationTicket[] {
  return serverTickets.filter((t) => t.status === 'pending' || t.status === 'assigned');
}

export function addKnowledgeChunk(chunk: Omit<KnowledgeChunk, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeChunk {
  const newChunk: KnowledgeChunk = {
    ...chunk,
    id: `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  serverChunks.push(newChunk);
  return newChunk;
}

export function getAllChunks(): KnowledgeChunk[] {
  return serverChunks;
}