import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { WorkflowRun } from '@/types';

const mockRuns: WorkflowRun[] = [
  {
    id: 101,
    name: 'CI Workflow',
    workflowName: 'ci.yml',
    status: 'success',
    conclusion: 'success',
    branch: 'main',
    commitSha: 'a1b2c3d',
    commitMessage: 'test commit',
    author: { name: 'jamespa001', avatarUrl: 'https://github.com/avatar.png' },
    createdAt: '2026-10-14T10:00:00Z',
    durationInSeconds: 90,
    htmlUrl: 'https://github.com/run/101',
    event: 'push',
  },
];

describe('AnalyticsDashboard Component', () => {
  it('renders summary KPI cards and metrics correctly', () => {
    render(<AnalyticsDashboard runs={mockRuns} />);

    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Avg Build Duration')).toBeInTheDocument();
    expect(screen.getByText('1m 30s')).toBeInTheDocument();
    expect(screen.getByText('Total Runs')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Build Pass / Fail Trend')).toBeInTheDocument();
  });
});
