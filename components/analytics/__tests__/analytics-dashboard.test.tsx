import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

const sampleEvents = [
  { kind: 'event', sessionId: 's1', ts: Date.now(), type: 'click' },
  { kind: 'perf', sessionId: 's1', ts: Date.now(), fps: 60 },
  { kind: 'event', sessionId: 's2', ts: Date.now(), type: 'error' },
];

describe('AnalyticsDashboard', () => {
  it('should render metrics summary', () => {
    render(<AnalyticsDashboard events={sampleEvents} />);
    expect(screen.getByText('Events (24h)')).toBeDefined();
    expect(screen.getByText('Perf Samples')).toBeDefined();
    expect(screen.getByText('Recommendations')).toBeDefined();
  });

  it('should show recent activity table', () => {
    render(<AnalyticsDashboard events={sampleEvents} />);
    expect(screen.getByText('Recent Activity')).toBeDefined();
  });

  it('should show export button', () => {
    render(<AnalyticsDashboard events={sampleEvents} />);
    expect(screen.getByText('Export JSON')).toBeDefined();
  });
});
