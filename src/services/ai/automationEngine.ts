/**
 * Automation Engine — Phase 3
 * Rule-based trigger/action engine for smart automation workflows.
 */
import { performanceMonitor } from '../performance';
import { IntentType, ProcessedCommand, nlpService } from './nlpService';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type TriggerEvent =
  | 'user_idle'
  | 'deadline_approaching'
  | 'project_at_risk'
  | 'new_comment'
  | 'task_assigned'
  | 'meeting_scheduled'
  | 'weekly_report'
  | 'user_churn_risk'
  | 'metric_threshold'
  | 'nlp_command';

export type ActionType =
  | 'send_notification'
  | 'assign_task'
  | 'update_deadline'
  | 'schedule_meeting'
  | 'generate_report'
  | 'escalate'
  | 'adjust_priority'
  | 'create_reminder'
  | 'send_email'
  | 'trigger_webhook';

export interface TriggerCondition {
  event: TriggerEvent;
  filter?: Record<string, unknown>;
  threshold?: number;
  compare?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

export interface ActionConfig {
  action: ActionType;
  target?: string;
  payload?: Record<string, unknown>;
  delaySeconds?: number;
}

export interface AutomationRuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: TriggerCondition;
  actions: ActionConfig[];
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  triggerEvent: TriggerEvent;
  actionsExecuted: Array<{ action: ActionType; target: string; status: 'success' | 'failed'; error?: string }>;
  startedAt: string;
  completedAt?: string;
  triggeredBy?: string;
}

// -----------------------------------------------------------------------
// In-memory state
// -----------------------------------------------------------------------

const rules: Map<string, AutomationRuleConfig> = new Map();
const recentExecutions: AutomationExecution[] = [];

// -----------------------------------------------------------------------
// Engine
// -----------------------------------------------------------------------

/**
 * Create or update an automation rule.
 */
export function createAutomationRule(config: Omit<AutomationRuleConfig, 'createdAt' | 'updatedAt'> & Partial<AutomationRuleConfig>): AutomationRuleConfig {
  const now = new Date().toISOString();
  const rule: AutomationRuleConfig = {
    ...config,
    id: config.id,
    name: config.name,
    description: config.description,
    enabled: config.enabled ?? true,
    trigger: config.trigger,
    actions: config.actions,
    createdAt: config.createdAt ?? now,
    updatedAt: now,
    ownerId: config.ownerId,
  };
  rules.set(rule.id, rule);
  return rule;
}

/**
 * Process a natural language command and match against automation rules.
 */
async function processCommand(text: string, userId?: string): Promise<{ processed: ProcessedCommand; actions: ActionConfig[] }> {
  const start = performance.now();
  const processed = nlpService.processNaturalLanguage(text);

  const matchedActions: ActionConfig[] = [];

  // Match rules triggered by nlp_command event
  for (const rule of rules.values()) {
    if (!rule.enabled) continue;
    if (rule.trigger.event !== 'nlp_command') continue;
    if (rule.trigger.filter?.intent !== processed.intent) continue;

    // Confidence threshold
    if (rule.trigger.threshold && processed.confidence < (rule.trigger.threshold / 100)) continue;

    matchedActions.push(...rule.actions);
  }

  const duration = performance.now() - start;
  performanceMonitor.track('custom', duration, {
    unit: 'ms',
    context: { event: 'automation_command_match', intent: processed.intent, matched_rules: matchedActions.length },
  });

  return { processed, actions: matchedActions };
}

/**
 * Evaluate a metric value against registered rules.
 */
function evaluateMetric(metricName: string, value: number): ActionConfig[] {
  const start = performance.now();
  const matched: ActionConfig[] = [];

  for (const rule of rules.values()) {
    if (!rule.enabled) continue;
    if (rule.trigger.event !== 'metric_threshold') continue;
    if (rule.trigger.filter?.metric !== metricName) continue;

    const threshold = rule.trigger.threshold ?? 0;
    const compare = rule.trigger.compare ?? 'gt';
    let triggered = false;

    switch (compare) {
      case 'gt': triggered = value > threshold; break;
      case 'lt': triggered = value < threshold; break;
      case 'eq': triggered = value === threshold; break;
      case 'gte': triggered = value >= threshold; break;
      case 'lte': triggered = value <= threshold; break;
    }

    if (triggered) {
      matched.push(...rule.actions);
    }
  }

  const duration = performance.now() - start;
  performanceMonitor.track('custom', duration, {
    unit: 'ms',
    context: { event: 'automation_metric_eval', metric: metricName, matched_actions: matched.length },
  });

  return matched;
}

/**
 * Execute actions for a rule (stubbed — integrates with notification/task systems in production).
 */
async function executeActions(
  ruleId: string,
  actions: ActionConfig[],
  triggerEvent: TriggerEvent,
  triggeredBy?: string
): Promise<AutomationExecution> {
  const execution: AutomationExecution = {
    id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ruleId,
    ruleName: rules.get(ruleId)?.name || 'unknown',
    triggerEvent,
    actionsExecuted: [],
    startedAt: new Date().toISOString(),
    triggeredBy,
  };

  for (const action of actions) {
    try {
      // In production, these would call actual service APIs
      // For now, we log the execution
      execution.actionsExecuted.push({
        action: action.action,
        target: action.target ?? 'system',
        status: 'success',
      });
    } catch (err: any) {
      execution.actionsExecuted.push({
        action: action.action,
        target: action.target ?? 'system',
        status: 'failed',
        error: err?.message ?? 'unknown error',
      });
    }
  }

  execution.completedAt = new Date().toISOString();
  recentExecutions.push(execution);

  // Keep only last 100 executions
  if (recentExecutions.length > 100) {
    recentExecutions.shift();
  }

  return execution;
}

/**
 * Get all rules for a given owner, or all rules if no owner specified.
 */
function getRules(ownerId?: string): AutomationRuleConfig[] {
  const all = Array.from(rules.values());
  if (ownerId) {
    return all.filter(r => r.ownerId === ownerId || !r.ownerId);
  }
  return all;
}

/**
 * Get recent execution history.
 */
function getExecutions(limit = 50): AutomationExecution[] {
  return recentExecutions.slice(-limit);
}

// -----------------------------------------------------------------------
// Default Rules (seed data)
// -----------------------------------------------------------------------

// Seed rule: Escalate project at risk
rules.set('rule-escalate-risk', {
  id: 'rule-escalate-risk',
  name: 'Escalate At-Risk Projects',
  description: 'When a project risk score exceeds 0.7, notify the project manager and escalate.',
  enabled: true,
  trigger: {
    event: 'project_at_risk',
    threshold: 70, // 70% risk score
  },
  actions: [
    { action: 'send_notification', target: 'project_manager', payload: { message: 'Project risk threshold exceeded' } },
    { action: 'escalate', target: 'senior_lead' },
    { action: 'send_email', target: 'client_stakeholder', payload: { template: 'risk_notification' } },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Seed rule: Re-engage at-risk users
rules.set('rule-reengage-churn', {
  id: 'rule-reengage-churn',
  name: 'Re-engage High Churn Risk Users',
  description: 'When a user churn risk exceeds 0.6, schedule a wellness check and assign a small task.',
  enabled: true,
  trigger: {
    event: 'user_churn_risk',
    threshold: 60, // 60% churn risk
  },
  actions: [
    { action: 'send_notification', target: 'user', payload: { message: 'We miss your contributions! Ready to jump back in?' } },
    { action: 'create_task', target: 'user', payload: { taskName: 'Quick sync-up chat', priority: 'low' } },
    { action: 'create_reminder', target: 'manager', delaySeconds: 86400, payload: { message: 'Follow up with churn-risk user' } },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Seed rule: Respond to schedule meeting command
rules.set('rule-process-meeting-command', {
  id: 'rule-process-meeting-command',
  name: 'Process Meeting Scheduling Command',
  description: 'When user says "schedule meeting", extract entities and create a calendar invite.',
  enabled: true,
  trigger: {
    event: 'nlp_command',
    filter: { intent: 'schedule_meeting' },
    threshold: 70,
  },
  actions: [
    { action: 'schedule_meeting', target: 'calendar_api', payload: { source: 'nlp_command' } },
    { action: 'send_notification', target: 'invitee', payload: { message: 'You have a new meeting scheduled' } },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// -----------------------------------------------------------------------
// Service Object
// -----------------------------------------------------------------------

export const automationEngine = {
  createAutomationRule,
  processCommand,
  evaluateMetric,
  executeActions,
  getRules,
  getExecutions,
};

export default automationEngine;
