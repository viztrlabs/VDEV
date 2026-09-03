/**
 * AI-Powered Collaboration Service — Phase 3
 * Real-time AI assistance for multi-user collaboration sessions.
 * Provides smart suggestions, role-based AI agents, and context-aware help.
 */
import { performanceMonitor } from '../performance';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type CollaborationRole = 'architect' | 'designer' | 'client' | 'developer' | 'guest';

export type AICollaborationEvent =
  | 'session.joined'
  | 'session.left'
  | 'comment.added'
  | 'comment.resolved'
  | 'suggestion.received'
  | 'task.created'
  | 'task.completed'
  | 'ai.mentioned'
  | 'annotation.added';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  role: CollaborationRole;
  avatar?: string;
  isOnline: boolean;
  joinedAt: Date;
  lastActive: Date;
}

export interface CollaborationComment {
  id: string;
  sessionId: string;
  authorId: string;
  content: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  mentions: string[];
  position?: { x: number; y: number; z?: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface AISuggestion {
  id: string;
  sessionId: string;
  type: 'design' | 'structural' | 'safety' | 'cost' | 'compliance' | 'accessibility';
  content: string;
  confidence: number;
  triggeredBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'dismissed';
  createdAt: Date;
  respondedAt?: Date;
}

export interface CollaborativeTask {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed';
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CollaborationAnnotation {
  id: string;
  sessionId: string;
  authorId: string;
  type: 'pin' | 'arrow' | 'highlight' | 'shape' | 'text';
  position: { x: number; y: number; z?: number };
  data: Record<string, unknown>;
  replyTo?: string;
  createdAt: Date;
}

export interface AIAgent {
  id: string;
  name: string;
  role: 'assistant' | 'reviewer' | 'critic' | 'mediator';
  persona: string;
  expertise: string[];
  avatar?: string;
  isActive: boolean;
}

export interface CollaborationSession {
  id: string;
  name: string;
  projectId?: string;
  ownerId: string;
  users: CollaborationUser[];
  comments: CollaborationComment[];
  suggestions: AISuggestion[];
  tasks: CollaborativeTask[];
  annotations: CollaborationAnnotation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationState {
  currentSession: CollaborationSession | null;
  recentSessions: CollaborationSession[];
  activeUsers: CollaborationUser[];
  pendingSuggestions: AISuggestion[];
  unreadCount: number;
}

// -----------------------------------------------------------------------
// AI Agents (personas)
// -----------------------------------------------------------------------

const AI_AGENTS: AIAgent[] = [
  {
    id: 'agent-architect',
    name: 'ArchAI',
    role: 'assistant',
    persona: 'Senior architect with expertise in spatial design, building codes, and accessibility standards.',
    expertise: ['architecture', 'spatial design', 'building codes', 'accessibility', 'sustainability'],
    isActive: false,
  },
  {
    id: 'agent-reviewer',
    name: 'ReviewBot',
    role: 'reviewer',
    persona: 'Meticulous design reviewer focused on consistency, brand guidelines, and user experience.',
    expertise: ['design review', 'UX', 'brand consistency', 'visual hierarchy', 'typography'],
    isActive: false,
  },
  {
    id: 'agent-critic',
    name: 'CriticAI',
    role: 'critic',
    persona: 'Constructive critic who challenges assumptions and surfaces hidden risks in design decisions.',
    expertise: ['risk assessment', 'conflict resolution', 'stakeholder alignment', 'trade-offs'],
    isActive: false,
  },
  {
    id: 'agent-mediator',
    name: 'MediateAI',
    role: 'mediator',
    persona: 'Diplomatic mediator helping teams reach consensus when design preferences conflict.',
    expertise: ['conflict resolution', 'consensus building', 'client communication', 'presentation'],
    isActive: false,
  },
];

// -----------------------------------------------------------------------
// State
// -----------------------------------------------------------------------

let currentState: CollaborationState = {
  currentSession: null,
  recentSessions: [],
  activeUsers: [],
  pendingSuggestions: [],
  unreadCount: 0,
};

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function mentionsContent(text: string): string[] {
  const matches = text.match(/@(\w+)/g) || [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

// -----------------------------------------------------------------------
// Session Management
// -----------------------------------------------------------------------

/**
 * Create a new collaboration session.
 * ponytail: single-host in-memory; add database + WebSocket for multi-instance.
 */
export async function createSession(params: {
  name: string;
  projectId?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerRole?: CollaborationRole;
}): Promise<CollaborationSession> {
  const stop = performanceMonitor?.start?.('collab.session.create');

  const owner: CollaborationUser = {
    id: params.ownerId,
    name: params.ownerName,
    email: params.ownerEmail,
    role: params.ownerRole ?? 'architect',
    isOnline: true,
    joinedAt: new Date(),
    lastActive: new Date(),
  };

  const session: CollaborationSession = {
    id: generateId('session'),
    name: params.name,
    projectId: params.projectId,
    ownerId: params.ownerId,
    users: [owner],
    comments: [],
    suggestions: [],
    tasks: [],
    annotations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  currentState.currentSession = session;
  currentState.recentSessions.unshift(session);
  if (currentState.recentSessions.length > 20) {
    currentState.recentSessions = currentState.recentSessions.slice(0, 20);
  }

  stop?.();
  return session;
}

/**
 * Join an existing session.
 */
export async function joinSession(params: {
  sessionId: string;
  user: Omit<CollaborationUser, 'isOnline' | 'joinedAt' | 'lastActive'>;
}): Promise<CollaborationSession | null> {
  const stop = performanceMonitor?.start?.('collab.session.join');

  const session = currentState.recentSessions.find((s) => s.id === params.sessionId)
    || currentState.currentSession;

  if (!session) {
    stop?.();
    return null;
  }

  const existingIdx = session.users.findIndex((u) => u.id === params.user.id);
  const collaborationUser: CollaborationUser = {
    ...params.user,
    isOnline: true,
    joinedAt: new Date(),
    lastActive: new Date(),
  };

  if (existingIdx >= 0) {
    session.users[existingIdx] = collaborationUser;
  } else {
    session.users.push(collaborationUser);
  }

  currentState.currentSession = session;
  currentState.activeUsers = session.users.filter((u) => u.isOnline);

  stop?.();
  return session;
}

/**
 * Leave a session.
 */
export async function leaveSession(params: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  const session = currentState.currentSession;
  if (!session || session.id !== params.sessionId) return;

  const user = session.users.find((u) => u.id === params.userId);
  if (user) user.isOnline = false;

  currentState.activeUsers = session.users.filter((u) => u.isOnline);
}

// -----------------------------------------------------------------------
// Comments
// -----------------------------------------------------------------------

/**
 * Add a comment to the session.
 */
export async function addComment(params: {
  sessionId: string;
  authorId: string;
  authorName: string;
  content: string;
  position?: { x: number; y: number; z?: number };
}): Promise<CollaborationComment> {
  const session = currentState.currentSession;
  if (!session) throw new Error('No active session');

  const comment: CollaborationComment = {
    id: generateId('comment'),
    sessionId: session.id,
    authorId: params.authorId,
    content: params.content,
    resolved: false,
    mentions: mentionsContent(params.content),
    position: params.position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  session.comments.push(comment);
  session.updatedAt = new Date();

  // If a user is mentioned, bump unread count
  if (comment.mentions.length > 0) {
    currentState.unreadCount++;
  }

  return comment;
}

/**
 * Resolve a comment.
 */
export async function resolveComment(params: {
  commentId: string;
  resolvedBy: string;
}): Promise<void> {
  const session = currentState.currentSession;
  if (!session) return;

  const comment = session.comments.find((c) => c.id === params.commentId);
  if (comment) {
    comment.resolved = true;
    comment.resolvedBy = params.resolvedBy;
    comment.resolvedAt = new Date();
    comment.updatedAt = new Date();
    session.updatedAt = new Date();
  }
}

// -----------------------------------------------------------------------
// AI Suggestions
// -----------------------------------------------------------------------

/**
 * Generate AI suggestions for the current session.
 * ponytail: in-memory heuristic; swap in real LLM calls for production.
 */
export async function generateSuggestions(params: {
  sessionId: string;
  triggeredBy: string;
  context?: string;
}): Promise<AISuggestion[]> {
  const stop = performanceMonitor?.start?.('collab.ai.suggest');
  const session = currentState.currentSession;
  if (!session) return [];

  const commentCount = session.comments.length;
  const userCount = session.users.length;

  const suggestions: AISuggestion[] = [];

  // Safety check if no comments yet
  if (commentCount === 0) {
    suggestions.push({
      id: generateId('sugg'),
      sessionId: session.id,
      type: 'design',
      content: 'Start by adding a comment to describe the first area you want to review.',
      confidence: 0.95,
      triggeredBy: params.triggeredBy,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Suggest accessibility review if 3+ comments
  if (commentCount >= 3) {
    suggestions.push({
      id: generateId('sugg'),
      sessionId: session.id,
      type: 'accessibility',
      content: `With ${commentCount} comments across ${userCount} participants, consider running an accessibility audit to ensure WCAG compliance.`,
      confidence: 0.82,
      triggeredBy: params.triggeredBy,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Suggest cost review if designer and architect present
  const roles = session.users.map((u) => u.role);
  if (roles.includes('designer') && roles.includes('architect')) {
    suggestions.push({
      id: generateId('sugg'),
      sessionId: session.id,
      type: 'cost',
      content: 'Both designer and architect are present. Good time to align on budget constraints and material specifications.',
      confidence: 0.78,
      triggeredBy: params.triggeredBy,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Suggest task creation for unresolved comments > 5
  const unresolved = session.comments.filter((c) => !c.resolved).length;
  if (unresolved > 5) {
    suggestions.push({
      id: generateId('sugg'),
      sessionId: session.id,
      type: 'structural',
      content: `${unresolved} unresolved comments detected. Create tasks to track resolution and assign owners.`,
      confidence: 0.88,
      triggeredBy: params.triggeredBy,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  session.suggestions.push(...suggestions);
  currentState.pendingSuggestions = session.suggestions.filter(
    (s) => s.status === 'pending'
  );

  stop?.();
  return suggestions;
}

/**
 * Respond to an AI suggestion (accept/reject/dismiss).
 */
export async function respondToSuggestion(params: {
  suggestionId: string;
  status: 'accepted' | 'rejected' | 'dismissed';
}): Promise<void> {
  const session = currentState.currentSession;
  if (!session) return;

  const suggestion = session.suggestions.find((s) => s.id === params.suggestionId);
  if (suggestion) {
    suggestion.status = params.status;
    suggestion.respondedAt = new Date();
    currentState.pendingSuggestions = session.suggestions.filter(
      (s) => s.status === 'pending'
    );
  }
}

// -----------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------

/**
 * Create a collaboration task.
 */
export async function createTask(params: {
  sessionId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  createdBy: string;
}): Promise<CollaborativeTask> {
  const session = currentState.currentSession;
  if (!session) throw new Error('No active session');

  const task: CollaborativeTask = {
    id: generateId('task'),
    sessionId: session.id,
    title: params.title,
    description: params.description,
    assigneeId: params.assigneeId,
    priority: params.priority ?? 'medium',
    status: 'open',
    dueDate: params.dueDate,
    createdBy: params.createdBy,
    createdAt: new Date(),
  };

  session.tasks.push(task);
  session.updatedAt = new Date();
  return task;
}

/**
 * Complete a task.
 */
export async function completeTask(params: {
  taskId: string;
}): Promise<void> {
  const session = currentState.currentSession;
  if (!session) return;

  const task = session.tasks.find((t) => t.id === params.taskId);
  if (task) {
    task.status = 'completed';
    task.completedAt = new Date();
    session.updatedAt = new Date();
  }
}

// -----------------------------------------------------------------------
// Annotations
// -----------------------------------------------------------------------

/**
 * Add a spatial annotation to the session.
 */
export async function addAnnotation(params: {
  sessionId: string;
  authorId: string;
  type: CollaborationAnnotation['type'];
  position: { x: number; y: number; z?: number };
  data: Record<string, unknown>;
  replyTo?: string;
}): Promise<CollaborationAnnotation> {
  const session = currentState.currentSession;
  if (!session) throw new Error('No active session');

  const annotation: CollaborationAnnotation = {
    id: generateId('ann'),
    sessionId: session.id,
    authorId: params.authorId,
    type: params.type,
    position: params.position,
    data: params.data,
    replyTo: params.replyTo,
    createdAt: new Date(),
  };

  session.annotations.push(annotation);
  session.updatedAt = new Date();
  return annotation;
}

// -----------------------------------------------------------------------
// State Access
// -----------------------------------------------------------------------

export function getCollaborationState(): CollaborationState {
  return { ...currentState };
}

export function getAIAgents(): AIAgent[] {
  return AI_AGENTS.map((a) => ({ ...a }));
}

export function activateAIAgent(agentId: string): AIAgent | null {
  const agent = AI_AGENTS.find((a) => a.id === agentId);
  if (agent) agent.isActive = true;
  return agent ?? null;
}

export function deactivateAIAgent(agentId: string): void {
  const agent = AI_AGENTS.find((a) => a.id === agentId);
  if (agent) agent.isActive = false;
}

/**
 * Get collaboration metrics for analytics.
 */
export function getCollaborationMetrics() {
  const session = currentState.currentSession;
  if (!session) {
    return {
      totalSessions: currentState.recentSessions.length,
      activeUsers: currentState.activeUsers.length,
      totalComments: 0,
      totalSuggestions: 0,
      resolvedSuggestions: 0,
      openTasks: 0,
      completedTasks: 0,
    };
  }

  return {
    totalSessions: currentState.recentSessions.length,
    activeUsers: session.users.filter((u) => u.isOnline).length,
    totalComments: session.comments.length,
    resolvedComments: session.comments.filter((c) => c.resolved).length,
    totalSuggestions: session.suggestions.length,
    resolvedSuggestions: session.suggestions.filter(
      (s) => s.status === 'accepted' || s.status === 'rejected'
    ).length,
    openTasks: session.tasks.filter((t) => t.status !== 'completed').length,
    completedTasks: session.tasks.filter((t) => t.status === 'completed').length,
    unreadCount: currentState.unreadCount,
  };
}
