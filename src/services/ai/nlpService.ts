/**
 * Natural Language Processing Service — Phase 3
 * Provides lightweight entity extraction and intent classification
 * for voice-to-action and chat-based workflows.
 */
import { performanceMonitor } from '../performance';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type IntentType =
  | 'schedule_meeting'
  | 'create_task'
  | 'assign_resource'
  | 'query_project'
  | 'update_deadline'
  | 'ask_support'
  | 'general_inquiry'
  | 'greeting'
  | 'unknown';

export interface Entity {
  type: 'person' | 'project' | 'date' | 'time' | 'task' | 'organization' | 'location' | 'metric';
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface ProcessedCommand {
  originalText: string;
  intent: IntentType;
  confidence: number;
  entities: Entity[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
}

export interface NLPExtractionResult {
  text: string;
  entities: Entity[];
  language: string;
  processedAt: number;
}

export interface IntentClassification {
  intent: IntentType;
  confidence: number;
  matchedKeywords: string[];
}

// -----------------------------------------------------------------------
// Keyword Maps
// -----------------------------------------------------------------------

const INTENT_KEYWORDS: Record<IntentType, string[]> = {
  schedule_meeting: ['schedule', 'meeting', 'book', 'call', 'sync', 'huddle', 'appointment'],
  create_task: ['create task', 'new task', 'add task', 'todo', 'to-do', 'create ticket', 'raise ticket'],
  assign_resource: ['assign', 'allocate', 'give to', 'delegate', 'hand off', 'push to'],
  query_project: ['status', 'where is', 'update', 'progress', 'timeline', 'deadline', 'how far', 'project'],
  update_deadline: ['extend', 'postpone', 'move', 'reschedule', 'push back', 'delay', 'deadline', 'due date'],
  ask_support: ['help', 'support', 'issue', 'bug', 'broken', 'problem', 'stuck', "can't", 'cannot'],
  general_inquiry: ['what', 'how', 'why', 'when', 'who', 'explain', 'tell me', 'info'],
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings'],
  unknown: [],
};

// Sentiment lexicon (lightweight)
const POSITIVE_WORDS = ['great', 'excellent', 'good', 'perfect', 'love', 'happy', 'success', 'congratulations', 'awesome', 'thank', 'thanks', 'appreciate'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'disappointed', 'broken', 'wrong', 'fail', 'issue', 'problem', 'stuck', 'urgent', 'asap'];

// Urgency indicators
const HIGH_URGENCY = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'now', 'today', 'deadline'];
const MEDIUM_URGENCY = ['soon', 'this week', 'priority', 'important', 'need', 'required', 'necessary'];

// -----------------------------------------------------------------------
// Internal Helpers
// -----------------------------------------------------------------------

/**
 * Single entity-extraction implementation.
 */
function performEntityExtraction(text: string): Entity[] {
  const entities: Entity[] = [];

  // Person mentions: @username
  const personRegex = /@(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = personRegex.exec(text)) !== null) {
    entities.push({
      type: 'person',
      value: m[1],
      confidence: 0.9,
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  // Person: "to: Name" or "assign to Name"
  const personAssignRegex = /(?:to:|assign to)\s+([A-Z][\w\s-]{1,40})/g;
  while ((m = personAssignRegex.exec(text)) !== null) {
    entities.push({
      type: 'person',
      value: m[1].trim(),
      confidence: 0.8,
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  // Project references: PROJ-123 or #slug
  const projectRegex = /\b([A-Z]{2,}-\d{3,})|#([A-Za-z0-9_-]+)/g;
  while ((m = projectRegex.exec(text)) !== null) {
    const value = m[1] ?? m[2];
    if (value) {
      entities.push({
        type: 'project',
        value,
        confidence: 0.85,
        startIndex: m.index,
        endIndex: m.index + m[0].length,
      });
    }
  }

  // Date patterns
  const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|next week|tomorrow|today|by (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;
  while ((m = dateRegex.exec(text)) !== null) {
    entities.push({
      type: 'date',
      value: m[1],
      confidence: 0.9,
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  // Time patterns
  const timeRegex = /\b(\d{1,2}:\d{2}\s*(?:am|pm)?)|in\s+(\d+)\s*(hours?|minutes?|hrs?|mins?)\b/gi;
  while ((m = timeRegex.exec(text)) !== null) {
    entities.push({
      type: 'time',
      value: m[1] ?? `${m[2]} ${m[3]}`,
      confidence: 0.85,
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  // Task reference
  const taskRegex = /(?:task|todo|item):\s*([^\n,.;]+)/gi;
  while ((m = taskRegex.exec(text)) !== null) {
    entities.push({
      type: 'task',
      value: m[1].trim(),
      confidence: 0.75,
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  // Metrics
  const metricRegex = /\b(render\s*time|fps|triangles|memory|load\s*time|duration)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(ms|fps|mb|triangles?)?\b/gi;
  while ((m = metricRegex.exec(text)) !== null) {
    entities.push({
      type: 'metric',
      value: `${m[1]}: ${m[2]}${m[3] ? ` ${m[3]}` : ''}`,
      confidence: 0.9,
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  return entities;
}

/**
 * Classify the intent of a text command using keyword matching.
 */
function classifyIntent(text: string): IntentClassification {
  const lower = text.toLowerCase();
  let bestIntent: IntentType = 'unknown';
  let bestScore = 0;
  const matched: string[] = [];

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length;
        matched.push(kw);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as IntentType;
    }
  }

  const wordCount = Math.max(1, lower.split(/\s+/).length);
  const confidence = Math.min(1, bestScore / wordCount);
  return { intent: bestIntent, confidence, matchedKeywords: matched };
}

/**
 * Determine sentiment from text using lightweight lexicon matching.
 */
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase();
  let posCount = 0;
  let negCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) posCount++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negCount++;
  }

  if (posCount > negCount + 1) return 'positive';
  if (negCount > posCount + 1) return 'negative';
  return 'neutral';
}

/**
 * Assess urgency level from text.
 */
function assessUrgency(text: string): 'low' | 'medium' | 'high' {
  const lower = text.toLowerCase();
  for (const word of HIGH_URGENCY) {
    if (lower.includes(word)) return 'high';
  }
  for (const word of MEDIUM_URGENCY) {
    if (lower.includes(word)) return 'medium';
  }
  return 'low';
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/**
 * Extract structured entities from free text.
 */
export function extractEntities(text: string): NLPExtractionResult {
  const start = performance.now();
  const entities = performEntityExtraction(text);
  const duration = performance.now() - start;

  performanceMonitor.track('custom', duration, {
    unit: 'ms',
    context: { event: 'nlp_entity_extraction', entity_count: entities.length },
  });

  return {
    text,
    entities,
    language: 'en',
    processedAt: Date.now(),
  };
}

/**
 * Process a natural language command into structured intent + entities.
 */
export function processNaturalLanguage(text: string): ProcessedCommand {
  const start = performance.now();

  const intent = classifyIntent(text);
  const entities = performEntityExtraction(text);
  const sentiment = analyzeSentiment(text);
  const urgency = assessUrgency(text);

  const duration = performance.now() - start;
  performanceMonitor.track('custom', duration, {
    unit: 'ms',
    context: { event: 'nlp_command_processing', intent: intent.intent },
  });

  return {
    originalText: text,
    intent: intent.intent,
    confidence: intent.confidence,
    entities,
    sentiment,
    urgency,
  };
}

// -----------------------------------------------------------------------
// Service Object
// -----------------------------------------------------------------------

export const nlpService = {
  processNaturalLanguage,
  extractEntities,
  classifyIntent,
  analyzeSentiment,
  assessUrgency,
};

export default nlpService;
