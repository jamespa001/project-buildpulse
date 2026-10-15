import { describe, it, expect } from 'vitest';
import { computeAnalytics } from '@/utils/analytics';
import { WorkflowRun } from '@/types';

const mockRuns: WorkflowRun[] = [
  {
    id: 1,
    name: 'CI Workflow',
    workflowName: 'ci.yml',
    status: 'success',
    conclusion: 'success',
    branch: 'main',
    commitSha: 'a1b2c3d',
    commitMessage: 'fix: update button styling',
    author: { name: 'jamespa001', avatarUrl: 'https://github.com/avatar.png' },
    createdAt: '2026-10-14T10:00:00Z',
    durationInSeconds: 120,
    htmlUrl: 'https://github.com/run/1',
    event: 'push',
  },
  {
    id: 2,
    name: 'CI Workflow',
    workflowName: 'ci.yml',
    status: 'failure',
    conclusion: 'failure',
    branch: 'main',
    commitSha: 'e5f6g7h',
    commitMessage: 'feat: add analytics dashboard',
    author: { name: 'jamespa001', avatarUrl: 'https://github.com/avatar.png' },
    createdAt: '2026-10-14T11:00:00Z',
    durationInSeconds: 180,
    htmlUrl: 'https://github.com/run/2',
    event: 'pull_request',
  },
];

describe('Analytics Utility', () => {
  it('computes metrics correctly for a list of runs', () => {
    const analytics = computeAnalytics(mockRuns);

    expect(analytics.totalRuns).toBe(2);
    expect(analytics.successRate).toBe(50.0);
    expect(analytics.avgDurationFormatted).toBe('2m 30s'); // (120 + 180) / 2 = 150s = 2m 30s
    expect(analytics.statusBreakdown.length).toBe(1);
    expect(analytics.statusBreakdown[0].successCount).toBe(1);
    expect(analytics.statusBreakdown[0].failureCount).toBe(1);
    expect(analytics.triggerBreakdown).toEqual([
      { name: 'push', count: 1 },
      { name: 'pull_request', count: 1 },
    ]);
  });

  it('handles empty runs array gracefully', () => {
    const analytics = computeAnalytics([]);

    expect(analytics.totalRuns).toBe(0);
    expect(analytics.successRate).toBe(0);
    expect(analytics.avgDurationFormatted).toBe('0m 0s');
    expect(analytics.statusBreakdown).toEqual([]);
    expect(analytics.triggerBreakdown).toEqual([]);
  });
});
