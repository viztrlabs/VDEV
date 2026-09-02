import { NextRequest, NextResponse } from 'next/server';
import { rbac, auditLogger, backupService, complianceEngine, monitoring, ssoService } from '@/src/services/enterprise';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? 'status';

  // Basic auth check (in real impl, use proper session)
  const role = req.headers.get('x-user-role') as 'SUPER_ADMIN' | 'ENTERPRISE_ADMIN' | undefined;
  if (!role || !['SUPER_ADMIN', 'ENTERPRISE_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            rbac: { rules: Object.keys(rbac.getControls ?? {}).length, active: true },
            audit: { events: auditLogger.size(), healthy: auditLogger.size() >= 0 },
            backup: { jobs: backupService.listJobs().length, backups: backupService.listBackups().length },
            compliance: { frameworks: complianceEngine.getFrameworks().length, reports: complianceEngine.listReports().length },
            monitoring: { rules: monitoring.getRules().length, activeAlerts: monitoring.getActiveAlerts().length },
            sso: { providers: ssoService['providers']?.size ?? 0 },
          },
        });

      case 'backups':
        return NextResponse.json({
          success: true,
          jobs: backupService.listJobs(),
          recent: backupService.listBackups().slice(0, 20),
          restorePoints: backupService.getRestorePoints().slice(0, 20),
        });

      case 'alerts':
        return NextResponse.json({
          success: true,
          active: monitoring.getActiveAlerts(),
          history: monitoring.getAlertHistory(50),
          rules: monitoring.getRules(),
        });

      case 'compliance': {
        const framework = searchParams.get('framework') as 'gdpr' | 'soc2' | 'iso27001' | 'hipaa' | 'custom' | null;
        if (framework) {
          const controls = complianceEngine.getControls(framework as never);
          return NextResponse.json({ success: true, controls, framework });
        }
        const reports = complianceEngine.listReports();
        return NextResponse.json({ success: true, reports, frameworks: complianceEngine.getFrameworks() });
      }

      case 'rbac':
        return NextResponse.json({
          success: true,
          rules: [
            { resource: 'organizations', actions: ['read', 'update', 'manage'], roles: ['ENTERPRISE_ADMIN', 'SUPER_ADMIN'] },
            { resource: 'projects', actions: ['create', 'read', 'update'], roles: ['ORG_ADMIN', 'PROJECT_MANAGER', 'SUPER_ADMIN'] },
            { resource: '3d_scenes', actions: ['create', 'read', 'update'], roles: ['DESIGNER', 'PROJECT_MANAGER', 'SUPER_ADMIN'] },
          ],
        });

      default:
        return NextResponse.json({ success: true, message: 'Enterprise API — use action param' });
    }
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const role = req.headers.get('x-user-role');
  if (!role || !['SUPER_ADMIN', 'ENTERPRISE_ADMIN', 'ORG_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Audit log the action
  auditLogger.log({
    severity: 'info',
    actor: { id: body.actorId ?? 'admin', email: body.actorEmail, role: role as string },
    action: body.action ?? 'unknown',
    resourceType: body.resourceType ?? 'system',
    resourceId: body.resourceId,
    changes: body.changes,
    requestBody: body,
  });

  const { action } = body;

  switch (action) {
    case 'trigger_backup': {
      const record = await backupService.triggerBackup(body.jobId ?? 'default-daily');
      return NextResponse.json({ success: true, backup: record });
    }

    case 'restore_backup': {
      const result = await backupService.restoreFromBackup(body.backupId);
      return NextResponse.json(result);
    }

    case 'evaluate_metric': {
      const alerts = monitoring.evaluateMetric(body.metricName, body.value);
      return NextResponse.json({ success: true, alerts });
    }

    case 'check_compliance': {
      const framework = body.framework as 'gdpr' | 'soc2' | 'iso27001' | 'hipaa';
      const { controlId, checker } = body;
      if (!controlId || !checker) {
        return NextResponse.json({ error: 'controlId and checker required' }, { status: 400 });
      }
      const result = await complianceEngine.runCheck(controlId, framework, checker);
      return NextResponse.json({ success: true, result });
    }

    case 'generate_compliance_report': {
      const { framework, period } = body;
      const report = await complianceEngine.generateReport(
        framework as never,
        period,
        body.format ?? 'json',
        body.generatedBy ?? 'api',
      );
      return NextResponse.json({ success: true, report });
    }

    case 'suppress_alert': {
      const ok = monitoring.suppressAlert(body.alertId, body.duration ?? '1h');
      return NextResponse.json({ success: ok });
    }

    case 'resolve_alert': {
      const ok = monitoring.resolveAlert(body.alertId);
      return NextResponse.json({ success: ok });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

export const enterpriseApi = {
  rbac,
  auditLogger,
  backupService,
  complianceEngine,
  monitoring,
  ssoService,
};

export default enterpriseApi;
