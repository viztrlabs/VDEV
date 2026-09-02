/**
 * Monitoring & Alerting System — Phase 2D
 * Real-time monitoring with threshold-based alerts, escalation policies,
 * and multi-channel notification delivery.
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertState = 'firing' | 'resolved' | 'suppressed';
export type AlertChannel = 'email' | 'webhook' | 'slack' | 'teams' | 'sms';
export type AlertConditionOp = 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte' | 'in' | 'not_in' | 'regex';

export interface MetricThreshold {
  id: string;
  metricName: string;
  description: string;
  operator: AlertConditionOp;
  threshold: number | string | (number | string)[];
  window: string; // e.g. "5m", "15m"
  severity: AlertSeverity;
  enabled: boolean;
  cooldown: string; // minimum time between alerts
  labels: Record<string, string>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  condition: {
    metricName: string;
    operator: AlertConditionOp;
    threshold: number | string;
    window: string;
    thresholdFunc?: (current: number, threshold: number) => boolean;
  };
  channels: AlertChannel[];
  escalationSteps: EscalationStep[];
  enabled: boolean;
  lastFired?: number;
  suppressedUntil?: number;
}

export interface EscalationStep {
  delay: string; // e.g. "0m", "5m", "15m"
  channels: AlertChannel[];
  recipient?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  state: AlertState;
  startedAt: number;
  endedAt?: number;
  currentValue: number | string;
  thresholdValue: number | string;
  title: string;
  description: string;
  runbook?: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  channelResults?: { channel: AlertChannel; delivered: boolean; error?: string }[];
}

interface ChannelHandler {
  send(alert: AlertEvent, step: EscalationStep): Promise<{ delivered: boolean; error?: string }>;
}

// Channel handlers (stub implementations)
const channelHandlers: Record<AlertChannel, ChannelHandler> = {
  email: {
    async send(alert) {
      return { delivered: true };
    },
  },
  webhook: {
    async send(alert, step) {
      try {
        const webhookUrl = step.recipient;
        if (!webhookUrl) return { delivered: false, error: 'No webhook URL' };
        // In real impl, would POST to webhookUrl
        return { delivered: true };
      } catch (err) {
        return { delivered: false, error: (err as Error).message };
      }
    },
  },
  slack: {
    async send() {
      return { delivered: true };
    },
  },
  teams: {
    async send() {
      return { delivered: true };
    },
  },
  sms: {
    async send() {
      return { delivered: true };
    },
  },
};

const ALERT_RULES: Map<string, AlertRule> = new Map();
const ACTIVE_ALERTS: Map<string, AlertEvent> = new Map();
const ALERT_HISTORY: AlertEvent[] = [];

// Default rules
const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'high-latency',
    name: 'High API Latency',
    description: 'API latency exceeds 500ms for 5 minutes',
    severity: 'critical',
    condition: {
      metricName: 'api_latency',
      operator: 'gt',
      threshold: 500,
      window: '5m',
      thresholdFunc: (current, threshold) => current > threshold,
    },
    channels: ['webhook', 'slack'],
    escalationSteps: [
      { delay: '0m', channels: ['webhook'], recipient: 'https://internal/webhook/alerts' },
      { delay: '5m', channels: ['slack'] },
      { delay: '15m', channels: ['email'] },
    ],
    enabled: true,
  },
  {
    id: 'low-fps',
    name: 'Low Frame Rate',
    description: 'Render FPS drops below 30 for 30 seconds',
    severity: 'warning',
    condition: {
      metricName: 'render_fps',
      operator: 'lt',
      threshold: 30,
      window: '30s',
      thresholdFunc: (current, threshold) => current < threshold,
    },
    channels: ['slack'],
    escalationSteps: [{ delay: '0m', channels: ['slack'] }],
    enabled: true,
  },
  {
    id: 'high-cpu',
    name: 'High CPU Usage',
    description: 'CPU usage exceeds 85% for 2 minutes',
    severity: 'warning',
    condition: {
      metricName: 'cpu_usage_pct',
      operator: 'gt',
      threshold: 85,
      window: '2m',
      thresholdFunc: (current, threshold) => current > threshold,
    },
    channels: ['webhook', 'email'],
    escalationSteps: [
      { delay: '0m', channels: ['webhook'], recipient: 'https://internal/webhook/infra' },
      { delay: '10m', channels: ['email'] },
    ],
    enabled: true,
  },
  {
    id: 'low-cache-hit',
    name: 'Low Cache Hit Rate',
    description: 'Cache hit rate drops below 80%',
    severity: 'warning',
    condition: {
      metricName: 'cache_hit_rate',
      operator: 'lt',
      threshold: 0.8,
      window: '1m',
      thresholdFunc: (current, threshold) => current < threshold,
    },
    channels: ['slack'],
    escalationSteps: [{ delay: '0m', channels: ['slack'] }],
    enabled: true,
  },
];

DEFAULT_RULES.forEach((r) => ALERT_RULES.set(r.id, r));

class MonitoringEngine {
  registerRule(rule: AlertRule): AlertRule {
    ALERT_RULES.set(rule.id, rule);
    return rule;
  }

  updateRule(id: string, patch: Partial<AlertRule>): AlertRule | null {
    const r = ALERT_RULES.get(id);
    if (!r) return null;
    const updated = { ...r, ...patch };
    ALERT_RULES.set(id, updated);
    return updated;
  }

  getRules(): AlertRule[] {
    return [...ALERT_RULES.values()];
  }

  getRule(id: string): AlertRule | undefined {
    return ALERT_RULES.get(id);
  }

  /**
   * Evaluate a metric value against all matching alert rules.
   */
  evaluateMetric(metricName: string, currentValue: number | string): AlertEvent[] {
    const fired: AlertEvent[] = [];

    for (const rule of ALERT_RULES.values()) {
      if (!rule.enabled) continue;
      if (rule.condition.metricName !== metricName) continue;

      const passes = rule.condition.thresholdFunc
        ? rule.condition.thresholdFunc(Number(currentValue), Number(rule.condition.threshold))
        : this.defaultCheck(Number(currentValue), rule.condition.operator, Number(rule.condition.threshold));

      if (!passes) continue;

      // Check cooldown
      if (rule.lastFired && Date.now() - rule.lastFired < this.parseDuration(rule.condition.window)) {
        continue;
      }
      rule.lastFired = Date.now();

      const alert: AlertEvent = {
        id: `alt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ruleId: rule.id,
        severity: rule.severity,
        state: 'firing',
        startedAt: Date.now(),
        currentValue,
        thresholdValue: rule.condition.threshold,
        title: rule.name,
        description: rule.description,
        runbook: rule.description,
        labels: { severity: rule.severity, rule: rule.id, metric: metricName },
        annotations: {
          description: rule.description,
          runbook: `Check ${metricName} values and review runbook.`,
        },
        channelResults: [],
      };

      // Send via first escalation step immediately
      void this.deliverAlert(alert, rule.escalationSteps[0], 0, rule);

      ACTIVE_ALERTS.set(alert.id, alert);
      ALERT_HISTORY.push(alert);
      if (ALERT_HISTORY.length > 10000) ALERT_HISTORY.shift();

      fired.push(alert);
    }

    return fired;
  }

  async deliverAlert(alert: AlertEvent, step: EscalationStep, stepIndex: number, rule: AlertRule): Promise<void> {
    const results = await Promise.all(
      step.channels.map(async (ch) => {
        try {
          const handler = channelHandlers[ch];
          if (!handler) return { channel: ch, delivered: false, error: 'Channel not configured' };
          const result = await handler.send(alert, step);
          return { channel: ch, delivered: result.delivered, error: result.error };
        } catch (err) {
          return { channel: ch, delivered: false, error: (err as Error).message };
        }
      }),
    );
    alert.channelResults = alert.channelResults ?? [];
    alert.channelResults.push(...results);

    // Schedule next escalation step
    if (stepIndex + 1 < rule.escalationSteps.length) {
      const delayMs = this.parseDuration(rule.escalationSteps[stepIndex + 1].delay);
      setTimeout(() => {
        void this.deliverAlert(alert, rule.escalationSteps[stepIndex + 1], stepIndex + 1, rule);
      }, delayMs);
    }
  }

  resolveAlert(alertId: string): boolean {
    const alert = ACTIVE_ALERTS.get(alertId);
    if (!alert) return false;
    alert.state = 'resolved';
    alert.endedAt = Date.now();
    ACTIVE_ALERTS.delete(alertId);
    return true;
  }

  suppressAlert(alertId: string, duration: string): boolean {
    const alert = ACTIVE_ALERTS.get(alertId);
    if (!alert) return false;
    alert.state = 'suppressed';
    const dur = this.parseDuration(duration);
    alert.suppressedUntil = Date.now() + dur;
    setTimeout(() => {
      if (alert.state === 'suppressed') alert.state = 'firing';
    }, dur);
    return true;
  }

  getActiveAlerts(): AlertEvent[] {
    return [...ACTIVE_ALERTS.values()];
  }

  getAlertHistory(limit = 100): AlertEvent[] {
    return ALERT_HISTORY.slice(-limit).reverse();
  }

  private defaultCheck(current: number, op: AlertConditionOp, threshold: number): boolean {
    switch (op) {
      case 'gt': return current > threshold;
      case 'lt': return current < threshold;
      case 'eq': return current === threshold;
      case 'ne': return current !== threshold;
      case 'gte': return current >= threshold;
      case 'lte': return current <= threshold;
      default: return false;
    }
  }

  private parseDuration(s: string): number {
    const match = s.match(/(\d+)([smhd])/);
    if (!match) return 0;
    const n = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return n * 1000;
      case 'm': return n * 60 * 1000;
      case 'h': return n * 3600 * 1000;
      case 'd': return n * 86400 * 1000;
      default: return 0;
    }
  }
}

export const monitoring = new MonitoringEngine();
export default monitoring;
