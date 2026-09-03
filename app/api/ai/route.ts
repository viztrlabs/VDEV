import { NextRequest, NextResponse } from 'next/server';
import {
  predictiveAnalytics,
  nlpService,
  automationEngine,
  mlPipeline,
  aiGovernance,
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
} from '@/src/services/ai';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? 'status';

  try {
    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          service: 'AI Platform',
          status: 'operational',
          components: {
            predictive_analytics: 'operational',
            nlp_service: 'operational',
            automation_engine: 'operational',
            ml_pipeline: 'operational',
            ai_governance: 'operational',
          },
          models_deployed: mlPipeline.listModels('deployed').length,
          rules_active: automationEngine.getRules().filter(r => r.enabled).length,
          policies: aiGovernance.getPolicies().length,
        });

      case 'predictions':
        return NextResponse.json({
          success: true,
          message:
            'Provide POST /api/ai with { "action": "predict_user" | "assess_project" } for predictions',
        });

      case 'models':
        return NextResponse.json({
          success: true,
          models: mlPipeline.listModels().map(m => ({
            id: m.id,
            name: m.name,
            type: m.type,
            version: m.version,
            status: m.status,
            framework: m.framework,
            lastUpdated: m.updatedAt,
          })),
        });

      case 'rules':
        return NextResponse.json({
          success: true,
          rules: automationEngine.getRules().map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            enabled: r.enabled,
            trigger: r.trigger,
            actionCount: r.actions.length,
          })),
        });

      case 'policies':
        return NextResponse.json({
          success: true,
          policies: aiGovernance.getPolicies().map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            description: p.description,
            severity: p.severity,
            enabled: p.enabled,
          })),
        });

      case 'audit-log': {
        const limit = parseInt(searchParams.get('limit') ?? '50');
        const logs = aiGovernance.getAuditLog().slice(-limit);
        return NextResponse.json({ success: true, logs, count: logs.length });
      }

      case 'bias-reports':
        return NextResponse.json({
          success: true,
          reports: Array.from(aiGovernance.getBiasReports().entries()).map(
            ([modelId, report]) => ({
              modelId,
              overallBiasScore: report.overallBiasScore,
              dimensions: report.dimensionScores.map(d => ({
                dimension: d.dimension,
                score: d.score,
              })),
              recommendations: report.recommendations,
            })
          ),
        });

      case 'collab-state':
        return NextResponse.json({
          success: true,
          state: getCollaborationState(),
        });

      case 'collab-agents':
        return NextResponse.json({
          success: true,
          agents: getAIAgents(),
        });

      case 'collab-metrics':
        return NextResponse.json({
          success: true,
          metrics: getCollaborationMetrics(),
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'AI Platform API — use action param',
        });
    }
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const { action } = body;

  // Basic auth check
  const role = req.headers.get('x-user-role');
  const allowedRoles = [
    'SUPER_ADMIN',
    'ENTERPRISE_ADMIN',
    'ORG_ADMIN',
    'PROJECT_MANAGER',
    'ADMIN',
  ];
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    switch (action) {
      case 'predict_user': {
        const prediction = predictiveAnalytics.predictUserBehavior(body.userProfile);
        return NextResponse.json({ success: true, prediction });
      }

      case 'assess_project': {
        const assessment = predictiveAnalytics.assessProjectRisk(body.projectMetrics);
        return NextResponse.json({ success: true, assessment });
      }

      case 'build_insights': {
        const insights = predictiveAnalytics.buildPredictiveInsights(
          body.users ?? [],
          body.projects ?? []
        );
        return NextResponse.json({ success: true, insights, count: insights.length });
      }

      case 'process_nlp': {
        const result = nlpService.processNaturalLanguage(body.text);
        return NextResponse.json({ success: true, ...result });
      }

      case 'extract_entities': {
        const result = nlpService.extractEntities(body.text);
        return NextResponse.json({ success: true, ...result });
      }

      case 'process_command': {
        const result = await automationEngine.processCommand(body.text, body.userId);
        return NextResponse.json({ success: true, ...result });
      }

      case 'evaluate_metric': {
        const actions = automationEngine.evaluateMetric(body.metricName, body.value);
        return NextResponse.json({ success: true, actions });
      }

      case 'register_model': {
        const model = mlPipeline.registerModel(body.config);
        return NextResponse.json({ success: true, model });
      }

      case 'train_model': {
        const job = mlPipeline.trainModel(body.modelId, body.data, body.trainingConfig);
        return NextResponse.json({ success: true, jobId: job.id });
      }

      case 'evaluate_model': {
        const metrics = await mlPipeline.evaluateModel(body.modelId, body.testData);
        return NextResponse.json({ success: true, metrics });
      }

      case 'deploy_model': {
        const deployment = await mlPipeline.deployModel(body.modelId, body.deployment);
        return NextResponse.json({ success: true, deployment });
      }

      case 'audit_ai_action': {
        const entry = aiGovernance.auditAIAction(
          body.modelId,
          body.action,
          body.actor,
          body.context
        );
        return NextResponse.json({ success: true, auditEntry: entry });
      }

      case 'validate_bias': {
        const report = await aiGovernance.validateModelBias(
          body.modelId,
          body.predictions,
          body.dimensions
        );
        return NextResponse.json({ success: true, report });
      }

      case 'check_compliance': {
        const check = await aiGovernance.checkCompliance(
          body.framework,
          body.controlId,
          body.context
        );
        return NextResponse.json({ success: true, check });
      }

      case 'set_policy': {
        const policy = aiGovernance.setPolicyEnabled(body.policyId, body.enabled);
        return NextResponse.json({ success: true, policy });
      }

      case 'create_rule': {
        const rule = automationEngine.createAutomationRule(body.config);
        return NextResponse.json({ success: true, rule });
      }

      // --- Collaboration ---
      case 'create_collab_session': {
        const session = await createSession(body);
        return NextResponse.json({ success: true, session });
      }

      case 'join_collab_session': {
        const session = await joinSession(body);
        return NextResponse.json({ success: true, session });
      }

      case 'leave_collab_session': {
        await leaveSession(body);
        return NextResponse.json({ success: true });
      }

      case 'add_collab_comment': {
        const comment = await addComment(body);
        return NextResponse.json({ success: true, comment });
      }

      case 'resolve_collab_comment': {
        await resolveComment(body);
        return NextResponse.json({ success: true });
      }

      case 'generate_collab_suggestions': {
        const suggestions = await generateSuggestions(body);
        return NextResponse.json({ success: true, suggestions });
      }

      case 'respond_collab_suggestion': {
        await respondToSuggestion(body);
        return NextResponse.json({ success: true });
      }

      case 'create_collab_task': {
        const task = await createTask(body);
        return NextResponse.json({ success: true, task });
      }

      case 'complete_collab_task': {
        await completeTask(body);
        return NextResponse.json({ success: true });
      }

      case 'add_collab_annotation': {
        const annotation = await addAnnotation(body);
        return NextResponse.json({ success: true, annotation });
      }

      case 'activate_collab_agent': {
        const agent = activateAIAgent(body.agentId);
        return NextResponse.json({ success: true, agent });
      }

      case 'deactivate_collab_agent': {
        deactivateAIAgent(body.agentId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}

const aiRoute = { GET, POST };
export default aiRoute;
