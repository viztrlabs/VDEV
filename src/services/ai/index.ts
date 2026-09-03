/**
 * AI/ML Services Barrel — Phase 3
 * Re-exports all Phase 3 AI and ML modules.
 */
export { predictiveAnalytics } from './predictiveAnalytics';
export type { PredictiveInsights, ChurnPrediction, ProjectRiskAssessment, EngagementMetrics } from './predictiveAnalytics';

export { nlpService } from './nlpService';
export type { IntentType, ProcessedCommand, Entity, SentimentResult, ProcessedText } from './nlpService';

export { automationEngine } from './automationEngine';
export type { AutomationRule, TriggerResult } from './automationEngine';

export { mlPipeline } from './mlPipeline';
export type { MLModel, TrainingConfig, TrainingResult, EvaluationResult } from './mlPipeline';

export { aiGovernance } from './aiGovernance';
export type { AIPolicy, BiasReport, ComplianceCheck } from './aiGovernance';

export {
  createSession,
  joinSession,
  leaveSession,
  addComment,
  resolveComment,
  generateSuggestions,
  respondToSuggestion,
  createTask,
  completeTask,
  addAnnotation,
  getCollaborationState,
  getAIAgents,
  activateAIAgent,
  deactivateAIAgent,
  getCollaborationMetrics,
} from './collaboration';
export type {
  CollaborationSession,
  CollaborationUser,
  CollaborationComment,
  AISuggestion,
  CollaborativeTask,
  CollaborationAnnotation,
  AIAgent,
  CollaborationState,
  CollaborationRole,
} from './collaboration';
