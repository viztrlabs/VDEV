/**
 * Predictive Analytics Engine — Phase 3
 * Provides user behavior predictions, project risk assessment, and churn analysis.
 */

import { performanceMonitor } from '../performance';

// Core Domain Types
export type UserRole = 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN' | 'ARTIST' | 'ENTERPRISE_ADMIN' | 'ORG_ADMIN' | 'DESIGNER' | 'PROJECT_MANAGER';
export type ProjectType = 'WEBXR' | 'GAUSSIAN_SPLAT' | 'VIRTUAL_TOUR' | 'UNREAL_STREAMING' | 'RENDER_CGI' | 'WEBGL_3D';
export type ProjectStatus = 'DISCOVERY' | 'CONTRACTING' | 'PRODUCING' | 'CLIENT_REVIEW' | 'DELIVERED' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

// -----------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  teamId?: string;
  joinDate: string;
  lastActive: string;
  activityLevel: 'low' | 'medium' | 'high';
  collaborationScore: number;
  performanceScore: number;
  churnRiskScore: number;
  weeklyHours: number;
  taskCompletionRate: number;
  communicationFrequency: number;
  projectDiversity: number;
  skillSet: string[];
  preferenceTags: string[];
}

export interface ProjectMetrics {
  projectId: string;
  status: ProjectStatus;
  type: ProjectType;
  createdAt: string;
  deadline: string;
  actualCompletion?: string | null;
  milestoneCount: number;
  completedMilestones: number;
  clientFeedbackScore: number;
  revisionCount: number;
  budgetUsed: number;
  budgetTotal: number;
  teamMembers: string[];
  renderTimeMs: number;
  lastActivity: string;
  riskFlags: string[];
}

export interface UserBehaviorPrediction {
  userId: string;
  churnRisk: number; // 0-1
  engagementForecast: 'declining' | 'stable' | 'improving';
  nextActiveWindow: { start: number; end: number };
  recommendedAction: string;
  confidence: number;
}

export interface ProjectRiskAssessment {
  projectId: string;
  overallRisk: number; // 0-1
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    recommendation: string;
  }>;
  predictedCompletionDate: string;
  budgetOverrunRisk: number;
  confidence: number;
}

export interface PredictiveInsight {
  type: 'user_prediction' | 'project_risk' | 'team_performance' | 'churn_alert';
  entityId: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  actionable: boolean;
  recommendedAction?: string;
  timestamp: number;
  expiresAt: number;
}

// -----------------------------------------------------------------------
// Heuristics (lightweight — no external model dependency)
// -----------------------------------------------------------------------

/**
 * Heuristic churn-scoring: combines activity recency, task completion,
 * and communication frequency into a 0-1 risk score.
 */
function computeChurnRisk(user: UserProfile): number {
  const now = Date.now();
  const lastActiveMs = new Date(user.lastActive).getTime();
  const daysSinceActive = (now - lastActiveMs) / (1000 * 60 * 60 * 24);

  const recencyScore = Math.min(1, daysSinceActive / 30); // 0 → 1 as days grow
  const completionComponent = 1 - Math.min(1, user.taskCompletionRate); // inverse: low completion = high risk
  const engagementComponent = 1 - user.collaborationScore;

  const weighted = 0.45 * recencyScore + 0.35 * completionComponent + 0.2 * engagementComponent;
  // Blend in the stored churnRiskScore if present (from prior model runs)
  return 0.7 * weighted + 0.3 * user.churnRiskScore;
}

/**
 * Heuristic project-risk scoring: based on milestone progress vs. timeline,
 * budget burn, revision count, and client feedback.
 */
function computeProjectRisk(project: ProjectMetrics): number {
  const milestoneProgress = project.milestoneCount > 0
    ? project.completedMilestones / project.milestoneCount
    : 0;

  const budgetBurn = project.budgetTotal > 0 ? project.budgetUsed / project.budgetTotal : 0;

  // Timeline slippage
  const expectedProgress = Math.min(1, (Date.now() - new Date(project.createdAt).getTime()) /
    (new Date(project.deadline).getTime() - new Date(project.createdAt).getTime()));
  const timelineVariance = Math.max(0, expectedProgress - milestoneProgress);

  // Revision penalty: more revisions beyond a baseline increase risk
  const revisionPenalty = Math.min(0.5, (project.revisionCount / 20) * 0.5);

  // Feedback penalty
  const feedbackPenalty = 1 - project.clientFeedbackScore; // 0-1 scale

  const rawRisk = 0.35 * timelineVariance + 0.3 * Math.min(1, budgetBurn) +
    0.2 * feedbackPenalty + 0.15 * revisionPenalty;

  return Math.min(1, Math.max(0, rawRisk));
}

/**
 * Predict next active window for a user based on communication frequency.
 * Returns a 50-minute window (in minutes from now).
 */
function predictNextActiveWindow(user: UserProfile): { start: number; end: number } {
  // Base on daily communication frequency
  const baseMinutes = user.communicationFrequency > 0
    ? (24 * 60) / Math.max(1, user.communicationFrequency)
    : 120; // default 2 hours

  const start = Math.min(60, Math.max(15, Math.round(baseMinutes * 0.8)));
  return { start, end: start + 50 };
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

export const predictiveAnalytics = {
  /** Predict user behavior and churn risk for a single user. */
  predictUserBehavior(user: UserProfile): UserBehaviorPrediction {
    const churnRisk = computeChurnRisk(user);

    const engagementTrend: 'declining' | 'stable' | 'improving' =
      churnRisk > 0.7 ? 'declining'
      : churnRisk > 0.4 ? 'stable'
      : 'improving';

    let recommendedAction: string;
    if (churnRisk > 0.7) {
      recommendedAction = `Schedule re-engagement outreach — user ${user.username} shows high churn risk (score: ${(churnRisk * 100).toFixed(0)}%). Review recent project feedback and assign a check-in task.`;
    } else if (churnRisk > 0.4) {
      recommendedAction = `Monitor user ${user.username} for decline — moderate churn risk detected. Consider a light-touch wellness touchpoint.`;
    } else {
      recommendedAction = `User ${user.username} shows healthy engagement. Continue current collaboration patterns.`;
    }

    return {
      userId: user.userId,
      churnRisk,
      engagementForecast: engagementTrend,
      nextActiveWindow: predictNextActiveWindow(user),
      recommendedAction,
      confidence: 0.82,
    };
  },

  /** Assess project delivery risk and budget overrun probability. */
  assessProjectRisk(project: ProjectMetrics): ProjectRiskAssessment {
    const overallRisk = computeProjectRisk(project);

    const riskFactors: ProjectRiskAssessment['riskFactors'] = [];

    // Milestone slippage
    const milestoneProgress = project.milestoneCount > 0
      ? project.completedMilestones / project.milestoneCount
      : 0;
    const expectedProgress = Math.min(1, (Date.now() - new Date(project.createdAt).getTime()) /
      (new Date(project.deadline).getTime() - new Date(project.createdAt).getTime()));

    if (expectedProgress - milestoneProgress > 0.2) {
      riskFactors.push({
        factor: 'Milestone Slippage',
        severity: 'high',
        impact: 0.35,
        recommendation: 'Review milestone dependencies and allocate additional resources to accelerate completion.',
      });
    }

    // Budget overrun
    const budgetBurn = project.budgetTotal > 0 ? project.budgetUsed / project.budgetTotal : 0;
    if (budgetBurn > 0.85) {
      riskFactors.push({
        factor: 'Budget Burn',
        severity: 'critical',
        impact: 0.3,
        recommendation: 'Budget burn exceeds 85%. Freeze non-critical scope and negotiate scope reduction with client.',
      });
    }

    // Revisions
    if (project.revisionCount > 5) {
      riskFactors.push({
        factor: 'Excessive Revisions',
        severity: 'medium',
        impact: 0.2,
        recommendation: 'High revision count suggests unclear requirements. Schedule detailed client review with sign-off gates.',
      });
    }

    // Client feedback
    if (project.clientFeedbackScore < 0.5) {
      riskFactors.push({
        factor: 'Poor Client Feedback',
        severity: 'medium',
        impact: 0.15,
        recommendation: 'Client feedback score is low. Assign senior artist for quality pass and schedule immediate client touchpoint.',
      });
    }

    // Predict completion date based on current velocity
    const daysElapsed = (Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const velocity = milestoneProgress / Math.max(0.1, daysElapsed);
    const remainingMilestones = project.milestoneCount - project.completedMilestones;
    const daysRemaining = velocity > 0 ? remainingMilestones / velocity : 30;
    const predictedCompletion = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

    // Budget overrun risk
    const budgetOverrunRisk = Math.min(1, budgetBurn / 0.9); // approaches 1 as burn approaches 90%+

    return {
      projectId: project.projectId,
      overallRisk,
      riskFactors,
      predictedCompletionDate: predictedCompletion.toISOString().split('T')[0],
      budgetOverrunRisk,
      confidence: 0.76,
    };
  },

  /** Build aggregated predictive insights for a cohort of users and projects. */
  buildPredictiveInsights(
    users: UserProfile[],
    projects: ProjectMetrics[]
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    // User-level predictions
    for (const user of users) {
      const prediction = this.predictUserBehavior(user);
      if (prediction.churnRisk > 0.6) {
        insights.push({
          type: 'churn_alert',
          entityId: user.userId,
          title: `High Churn Risk: ${user.username}`,
          description: `User has a ${(prediction.churnRisk * 100).toFixed(0)}% churn risk. Last active: ${user.lastActive}.`,
          severity: prediction.churnRisk > 0.8 ? 'critical' : 'warning',
          confidence: prediction.confidence,
          actionable: true,
          recommendedAction: prediction.recommendedAction,
          timestamp: now,
          expiresAt: now + weekMs,
        });
      }
    }

    // Project-level risk assessments
    for (const project of projects) {
      const assessment = this.assessProjectRisk(project);
      if (assessment.overallRisk > 0.4) {
        insights.push({
          type: 'project_risk',
          entityId: project.projectId,
          title: `Project at Risk: ${project.projectId}`,
          description: `Project risk score ${Math.round(assessment.overallRisk * 100)}%. ${assessment.riskFactors.length} risk factor(s) identified.`,
          severity: assessment.overallRisk > 0.7 ? 'critical' : 'warning',
          confidence: assessment.confidence,
          actionable: true,
          recommendedAction: assessment.riskFactors[0]?.recommendation ?? 'Review project health.',
          timestamp: now,
          expiresAt: now + weekMs,
        });
      }
    }

    // Record performance telemetry
    performanceMonitor.track('custom', insights.filter(i => i.severity === 'critical').length, {
      unit: 'count',
      context: { event: 'predictive_critical_insights', count: 2 },
    });

    return insights;
  },

  /** Expose the heuristic churn function for external callers. */
  computeChurnRisk,
  /** Expose the heuristic project-risk function for external callers. */
  computeProjectRisk,
};

export default predictiveAnalytics;
