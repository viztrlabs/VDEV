/**
 * Compliance Reporting Engine — Phase 2D
 * GDPR, SOC 2, ISO 27001, HIPAA compliance monitoring and automated reporting.
 */

export type ComplianceFramework = 'gdpr' | 'soc2' | 'iso27001' | 'hipaa' | 'custom';
export type ControlStatus = 'pass' | 'fail' | 'partial' | 'not_applicable' | 'pending';
export type ReportFormat = 'pdf' | 'json' | 'csv' | 'html';

export interface ComplianceControl {
  id: string;
  framework: ComplianceFramework;
  category: string;
  title: string;
  description: string;
  requirement: string;
  status: ControlStatus;
  lastChecked: number;
  nextCheck: number;
  owner?: string;
  evidence: string[];
  remediation?: string;
}

export interface ComplianceCheckResult {
  controlId: string;
  status: ControlStatus;
  checkedAt: number;
  details: string[];
  evidenceCollected: boolean;
  evidencePath?: string;
  failed?: boolean;
}

export interface ComplianceReport {
  id: string;
  framework: ComplianceFramework;
  generatedAt: number;
  generatedBy: string;
  period: { start: number; end: number };
  overallScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  controls: ComplianceCheckResult[];
  recommendations: string[];
  executiveSummary: string;
  format: ReportFormat;
}

export interface ComplianceEvidence {
  controlId: string;
  type: 'log' | 'config' | 'audit' | 'scan' | 'manual';
  path: string;
  collectedAt: number;
  hash: string;
  description: string;
}

// Controls mapped to frameworks
const COMPLIANCE_CONTROLS: Record<ComplianceFramework, Omit<ComplianceControl, 'status' | 'lastChecked' | 'nextCheck'>[]> = {
  gdpr: [
    {
      id: 'gdpr_001',
      framework: 'gdpr',
      category: 'data-protection',
      title: 'Data Processing Records',
      description: 'Maintain records of all data processing activities',
      requirement: 'Article 30 - Records of processing activities',
      owner: 'Compliance Officer',
      evidence: [],
      remediation: 'Implement automated data processing logs',
    },
    {
      id: 'gdpr_002',
      framework: 'gdpr',
      category: 'data-rights',
      title: 'Right to Access',
      description: 'Enable data subjects to access their personal data',
      requirement: 'Article 15 - Right of access by the data subject',
      owner: 'Privacy Team',
      evidence: [],
    },
    {
      id: 'gdpr_003',
      framework: 'gdpr',
      category: 'data-security',
      title: 'Data Security',
      description: 'Implement appropriate technical and organizational measures',
      requirement: 'Article 32 - Security of processing',
      owner: 'Security Team',
      evidence: [],
    },
    {
      id: 'gdpr_004',
      framework: 'gdpr',
      category: 'breach-notification',
      title: 'Breach Notification',
      description: 'Notify supervisory authority of data breaches',
      requirement: 'Article 33 - Notification of a personal data breach',
      owner: 'Security Officer',
      evidence: [],
    },
  ],
  soc2: [
    {
      id: 'soc2_001',
      framework: 'soc2',
      category: 'security',
      title: 'Logical Access Controls',
      description: 'Restrict logical access to systems and data',
      requirement: 'CC6.1 - The entity grants appropriate logical access',
      owner: 'Security Team',
      evidence: [],
    },
    {
      id: 'soc2_002',
      framework: 'soc2',
      category: 'availability',
      title: 'System Availability',
      description: 'Meet relevant availability commitments',
      requirement: 'A1.2 - The entity selects and develops controls to meet...',
      owner: 'Operations',
      evidence: [],
    },
    {
      id: 'soc2_003',
      framework: 'soc2',
      category: 'confidentiality',
      title: 'Confidentiality',
      description: 'Protect confidential information',
      requirement: 'C1.1 - The entity implements logical access controls',
      owner: 'Security Team',
      evidence: [],
    },
  ],
  iso27001: [
    {
      id: 'iso27001_001',
      framework: 'iso27001',
      category: 'access-control',
      title: 'User Access Management',
      description: 'Manage user access rights',
      requirement: 'A.9.2.3 - User access rights',
      owner: 'IT Security',
      evidence: [],
    },
    {
      id: 'iso27001_002',
      framework: 'iso27001',
      category: 'cryptography',
      title: 'Cryptographic Controls',
      description: 'Use of cryptography for security',
      requirement: 'A.10.1.1 - Policy on use of cryptographic controls',
      owner: 'Security Team',
      evidence: [],
    },
    {
      id: 'iso27001_003',
      framework: 'iso27001',
      category: 'incident-mgmt',
      title: 'Information Security Incident Management',
      description: 'Manage information security incidents',
      requirement: 'A.16.1.4 - Review of information security continuity',
      owner: 'Security Operations',
      evidence: [],
    },
  ],
  hipaa: [
    {
      id: 'hipaa_001',
      framework: 'hipaa',
      category: 'administrative-safeguards',
      title: 'Security Management Process',
      description: 'Implement policies for managing security risks',
      requirement: '164.308(a)(1)(i) - Security management process',
      owner: 'Compliance Officer',
      evidence: [],
    },
    {
      id: 'hipaa_002',
      framework: 'hipaa',
      category: 'physical-safeguards',
      title: 'Facility Access Controls',
      description: 'Implement policies for facility access',
      requirement: '164.310(a)(1) - Facility access controls',
      owner: 'Facilities',
      evidence: [],
    },
    {
      id: 'hipaa_003',
      framework: 'hipaa',
      category: 'technical-safeguards',
      title: 'Access Control',
      description: 'Implement technical access controls',
      requirement: '164.312(a)(1) - Access control',
      owner: 'Security Team',
      evidence: [],
    },
  ],
  custom: [],
};

const EVIDENCE: Map<string, ComplianceEvidence[]> = new Map();
const CHECK_RESULTS: Map<string, ComplianceCheckResult[]> = new Map();
const REPORTS: Map<string, ComplianceReport> = new Map();

class ComplianceEngine {
  getControls(framework: ComplianceFramework): ComplianceControl[] {
    const base = COMPLIANCE_CONTROLS[framework] ?? COMPLIANCE_CONTROLS.custom;
    return base.map((c) => ({
      ...c,
      status: 'pending',
      lastChecked: 0,
      nextCheck: Date.now() + 7 * 24 * 3600 * 1000,
    }));
  }

  registerEvidence(evidence: ComplianceEvidence): void {
    const existing = EVIDENCE.get(evidence.controlId) ?? [];
    existing.push(evidence);
    EVIDENCE.set(evidence.controlId, existing);
  }

  getEvidence(controlId: string): ComplianceEvidence[] {
    return EVIDENCE.get(controlId) ?? [];
  }

  async runCheck(
    controlId: string,
    framework: ComplianceFramework,
    checker: (context: unknown) => Promise<ComplianceCheckResult>,
  ): Promise<ComplianceCheckResult> {
    const result = await checker({ controlId, framework });
    const existing = CHECK_RESULTS.get(controlId) ?? [];
    existing.push(result);
    CHECK_RESULTS.set(controlId, existing);
    return result;
  }

  async generateReport(
    framework: ComplianceFramework,
    period: { start: number; end: number },
    format: ReportFormat = 'json',
    generatedBy = 'system',
  ): Promise<ComplianceReport> {
    const controls = this.getControls(framework);
    const allResults: ComplianceCheckResult[] = [];
    for (const c of controls) {
      const results = CHECK_RESULTS.get(c.id) ?? [];
      const latest = results.filter((r) => r.checkedAt >= period.start);
      allResults.push(...latest);
    }

    const passed = allResults.filter((r) => r.status === 'pass').length;
    const failed = allResults.filter((r) => r.status === 'fail').length;
    const total = controls.length;
    const score = total > 0 ? (passed / total) * 100 : 0;

    const recommendations: string[] = [];
    for (const c of controls) {
      const r = allResults.find((r) => r.controlId === c.id && r.failed);
      if (r) {
        recommendations.push(`Fix control ${c.id}: ${c.title} - ${r.details.join('; ')}`);
      }
    }

    const report: ComplianceReport = {
      id: `rpt_${framework}_${Date.now()}`,
      framework,
      generatedAt: Date.now(),
      generatedBy,
      period,
      overallScore: score,
      totalControls: total,
      passedControls: passed,
      failedControls: failed,
      controls: allResults.slice(-200), // latest results
      recommendations,
      executiveSummary: this.buildExecutiveSummary(framework, score, passed, failed, total, recommendations),
      format,
    };

    REPORTS.set(report.id, report);
    return report;
  }

  private buildExecutiveSummary(
    framework: ComplianceFramework,
    score: number,
    passed: number,
    failed: number,
    total: number,
    recommendations: string[],
  ): string {
    const frameworkNames: Record<ComplianceFramework, string> = {
      gdpr: 'GDPR',
      soc2: 'SOC 2',
      iso27001: 'ISO 27001',
      hipaa: 'HIPAA',
      custom: 'Custom',
    };
    const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';
    return `${frameworkNames[framework]} Compliance Report - Grade: ${grade}
Overall Score: ${score.toFixed(1)}% (${passed}/${total} controls passed, ${failed} failed).
${recommendations.length > 0
      ? `${recommendations.length} remediation actions required.`
      : 'No remediation actions required.'}
${recommendations.length > 0 ? `Key issue: ${recommendations[0]}` : ''}`;
  }

  getFrameworks(): ComplianceFramework[] {
    return ['gdpr', 'soc2', 'iso27001', 'hipaa', 'custom'];
  }

  getReport(id: string): ComplianceReport | undefined {
    return REPORTS.get(id);
  }

  listReports(framework?: ComplianceFramework): ComplianceReport[] {
    return [...REPORTS.values()]
      .filter((r) => !framework || r.framework === framework)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }
}

export const complianceEngine = new ComplianceEngine();
export default complianceEngine;
