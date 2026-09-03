/**
 * AI Governance Framework — Phase 3
 * Ensures responsible AI usage through policy validation, bias auditing,
 * and compliance checking for all AI-powered features.
 */
import { performanceMonitor } from '../performance';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type GovernancePolicyType =
  | 'model_deployment'
  | 'data_privacy'
  | 'bias_audit'
  | 'fairness'
  | 'transparency'
  | 'accountability'
  | 'human_oversight';

export type ComplianceFramework = 'gdpr' | 'soc2' | 'iso27001' | 'hipaa' | 'nist_ai-rmf' | 'eu_ai_act';

export interface GovernancePolicy {
  id: string;
  type: GovernancePolicyType;
  name: string;
  description: string;
  severity: 'advisory' | 'required' | 'prohibited';
  enabled: boolean;
  condition: (context: Record<string, unknown>) => boolean;
  createdAt: string;
  updatedAt: string;
  createdAtBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  modelId: string;
  action: string;
  actor: string;
  inputSnapshot?: Record<string, unknown>;
  outputSnapshot?: Record<string, unknown>;
  decision: 'approved' | 'rejected' | 'flagged';
  policyViolations: string[];
  confidence: number;
  executionTimeMs: number;
}

export interface BiasReport {
  modelId: string;
  timestamp: number;
  overallBiasScore: number; // 0-1, lower is better
  dimensionScores: Array<{
    dimension: string; // e.g., 'gender', 'age', 'location', 'role'
    score: number;
    disparities: Array<{
      subgroup: string;
      positiveRate: number;
      negativeRate: number;
      disparityRatio: number;
    }>;
  }>;
  recommendations: string[];
  dataSkew: boolean;
}

export interface ComplianceCheck {
  framework: ComplianceFramework;
  controlId: string;
  status: 'pass' | 'fail' | 'partial';
  description: string;
  evidence: string;
  remediation?: string;
}

// -----------------------------------------------------------------------
// Policy Definitions
// -----------------------------------------------------------------------

const POLICIES: GovernancePolicy[] = [
  {
    id: 'policy-model-deployment-approval',
    type: 'model_deployment',
    name: 'Model Deployment Approval',
    description: 'All models must have a minimum accuracy of 0.80 and pass bias audit before production deployment.',
    severity: 'required',
    enabled: true,
    condition: (ctx) => {
      const accuracy = ctx.accuracy as number | undefined;
      const biasScore = ctx.biasScore as number | undefined;
      const environment = ctx.environment as string | undefined;
      return environment === 'production' && (accuracy < 0.80 || (biasScore !== undefined && biasScore > 0.3));
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAtBy: 'governance-framework',
  },
  {
    id: 'policy-no-pii-in-training',
    type: 'data_privacy',
    name: 'PII in Training Data',
    description: 'Training data must not contain personally identifiable information.',
    severity: 'prohibited',
    enabled: true,
    condition: (ctx) => {
      const containsPii = ctx.containsPii as boolean | undefined;
      return containsPii === true;
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAtBy: 'governance-framework',
  },
  {
    id: 'policy-high-confidence-threshold',
    type: 'transparency',
    name: 'Low Confidence Predictions Flagged',
    description: 'AI predictions with confidence below 0.7 must be flagged for human review.',
    severity: 'required',
    enabled: true,
    condition: (ctx) => {
      const confidence = ctx.confidence as number | undefined;
      return confidence !== undefined && confidence < 0.7;
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAtBy: 'governance-framework',
  },
  {
    id: 'policy-regular-bias-audit',
    type: 'bias_audit',
    name: 'Regular Bias Auditing',
    description: 'Models must undergo bias auditing every 90 days.',
    severity: 'required',
    enabled: true,
    condition: (ctx) => {
      const lastAudit = ctx.lastAudit as number | undefined;
      const daysSince = lastAudit ? (Date.now() - lastAudit) / (1000 * 60 * 60 * 24) : Infinity;
      return daysSince > 90;
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAtBy: 'governance-framework',
  },
];

// In-memory audit log
const auditLogs: AuditLogEntry[] = [];
const biasReports: Map<string, BiasReport> = new Map();

// -----------------------------------------------------------------------
// Governance Operations
// -----------------------------------------------------------------------

/**
 * Audit an AI action for policy violations.
 */
export function auditAIAction(
  modelId: string,
  action: string,
  actor: string,
  context: Record<string, unknown>,
): AuditLogEntry {
  const start = performance.now();
  const violations: string[] = [];

  for (const policy of POLICIES) {
    if (!policy.enabled) continue;
    const violated = policy.condition(context);
    if (violated) {
      violations.push(`${policy.type}:${policy.name}`);
    }
  }

  const decision: 'approved' | 'rejected' | 'flagged' =
    violations.length > 0 ? 'flagged' : 'approved';

  // If any 'prohibited' policy is violated, escalate to 'rejected'
  const hasProhibited = violations.some(v =>
    POLICIES.find(p => `${p.type}:${p.name}` === v && p.severity === 'prohibited')
  );
  const finalDecision = hasProhibited ? 'rejected' : decision;

  const executionTimeMs = performance.now() - start;

  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    modelId,
    action,
    actor,
    inputSnapshot: context.input as Record<string, unknown>,
    outputSnapshot: context.output as Record<string, unknown>,
    decision: finalDecision,
    policyViolations: violations,
    confidence: context.confidence as number ?? 1.0,
    executionTimeMs,
  };

  auditLogs.push(entry);
  // Keep last 1000 entries
  if (auditLogs.length > 1000) auditLogs.shift();

  performanceMonitor.track('custom', executionTimeMs, {
    unit: 'ms',
    context: { event: 'governance_audit', model_id: modelId, decision: finalDecision, violations: violations.length },
  });

  return entry;
}

/**
 * Run bias detection on model predictions.
 */
export async function validateModelBias(
  modelId: string,
  predictions: Array<{
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }>,
  dimensions: string[] = ['gender', 'age', 'location', 'role'],
): Promise<BiasReport> {
  const start = performance.now();

  // Simulate bias analysis
  await new Promise(r => setTimeout(r, 500));

  const dimensionScores: BiasReport['dimensionScores'] = [];

  for (const dim of dimensions) {
    const subgroups: Record<string, { positive: number; total: number }> = {};

    for (const pred of predictions) {
      const groupKey = pred.input[dim] as string ?? 'unknown';
      if (!subgroups[groupKey]) {
        subgroups[groupKey] = { positive: 0, total: 0 };
      }
      subgroups[groupKey].total++;
      if (pred.output.decision === 'positive' || pred.output.predicted === 1) {
        subgroups[groupKey].positive++;
      }
    }

    const overallPositiveRate = predictions.filter(p =>
      p.output.decision === 'positive' || p.output.predicted === 1
    ).length / predictions.length;

    const disparities = Object.entries(subgroups).map(([subgroup, counts]) => {
      const subgroupPositiveRate = counts.total > 0 ? counts.positive / counts.total : 0;
      const disparityRatio = overallPositiveRate > 0 ? subgroupPositiveRate / overallPositiveRate : subgroupPositiveRate;
      return {
        subgroup,
        positiveRate: subgroupPositiveRate,
        negativeRate: 1 - subgroupPositiveRate,
        disparityRatio,
      };
    });

    // Score: 1 = no bias, 0 = maximum bias
    const maxDisparity = Math.max(...disparities.map(d => d.disparityRatio), 0);
    const minDisparity = Math.min(...disparities.map(d => d.disparityRatio), 1);
    const score = 1 - Math.abs(maxDisparity - minDisparity);

    dimensionScores.push({
      dimension: dim,
      score: Math.max(0, Math.min(1, score)),
      disparities,
    });
  }

  const overallBiasScore = dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length;

  const recommendations: string[] = [];
  if (overallBiasScore < 0.7) {
    recommendations.push('High bias detected. Collect more balanced training data.');
  }
  if (overallBiasScore < 0.85) {
    recommendations.push('Moderate bias detected. Consider re-weighting training data.');
  }
  const dataSkew = overallBiasScore < 0.85;

  const report: BiasReport = {
    modelId,
    timestamp: Date.now(),
    overallBiasScore,
    dimensionScores,
    recommendations,
    dataSkew,
  };

  // Store latest report
  biasReports.set(modelId, report);

  const duration = performance.now() - start;
  performanceMonitor.track('custom', duration, {
    unit: 'ms',
    context: { event: 'bias_validation', model_id: modelId, bias_score: overallBiasScore },
  });

  return report;
}

/**
 * Check compliance against a specific framework control.
 */
export async function checkCompliance(
  framework: ComplianceFramework,
  controlId: string,
  context: Record<string, unknown> = {},
): Promise<ComplianceCheck> {
  // Simulate compliance check
  await new Promise(r => setTimeout(r, 100));

  // Framework-specific check logic
  let status: 'pass' | 'fail' | 'partial' = 'pass';
  let evidence = '';

  switch (framework) {
    case 'gdpr':
      if (controlId === 'data-minimization') {
        const hasPii = context.containsPii as boolean;
        status = hasPii ? 'fail' : 'pass';
        evidence = hasPii
          ? 'PII detected in input data'
          : 'No PII detected in model inputs';
      }
      break;
    case 'soc2':
      if (controlId === 'availability') {
        const uptime = context.uptime as number ?? 1;
        status = uptime >= 0.99 ? 'pass' : uptime >= 0.95 ? 'partial' : 'fail';
        evidence = `Model uptime: ${(uptime * 100).toFixed(2)}%`;
      }
      break;
    case 'nist_ai-rmf':
      if (controlId === 'human-oversight') {
        const humanOverride = context.humanOverride as boolean;
        status = humanOverride ? 'pass' : 'partial';
        evidence = humanOverride ? 'Human-in-the-loop enabled' : 'No human oversight mechanism';
      }
      break;
  }

  const remediation = status === 'fail'
    ? 'Implement corrective controls and re-audit'
    : status === 'partial'
    ? 'Address partial compliance gap'
    : undefined;

  return {
    framework,
    controlId,
    status,
    description: `Compliance check for ${framework} / ${controlId}`,
    evidence,
    remediation,
  };
}

/**
 * Get all governance policies.
 */
export function getPolicies(): GovernancePolicy[] {
  return POLICIES;
}

/**
 * Enable/disable a policy.
 */
export function setPolicyEnabled(policyId: string, enabled: boolean): GovernancePolicy | null {
  const policy = POLICIES.find(p => p.id === policyId);
  if (policy) {
    policy.enabled = enabled;
    policy.updatedAt = new Date().toISOString();
    return policy;
  }
  return null;
}

/**
 * Get audit log (optionally filtered).
 */
export function getAuditLog(
  filter?: Partial<Pick<AuditLogEntry, 'modelId' | 'action' | 'decision'>>
): AuditLogEntry[] {
  if (!filter) return [...auditLogs];
  return auditLogs.filter(entry => {
    if (filter.modelId && entry.modelId !== filter.modelId) return false;
    if (filter.action && entry.action !== filter.action) return false;
    if (filter.decision && entry.decision !== filter.decision) return false;
    return true;
  });
}

/**
 * Get bias reports.
 */
export function getBiasReports(): Map<string, BiasReport> {
  return biasReports;
}

// -----------------------------------------------------------------------
// Service Object
// -----------------------------------------------------------------------

export const aiGovernance = {
  auditAIAction,
  validateModelBias,
  checkCompliance,
  getPolicies,
  setPolicyEnabled,
  getAuditLog,
  getBiasReports,
};

export default aiGovernance;
