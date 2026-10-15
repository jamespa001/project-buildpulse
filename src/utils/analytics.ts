import { WorkflowRun } from '@/types';

export interface AnalyticsSummary {
  totalRuns: number;
  successRate: number; // percentage e.g. 96.4
  avgDurationFormatted: string;
  durationTrend: { date: string; avgDurationMinutes: number }[];
  statusBreakdown: {
    date: string;
    successCount: number;
    failureCount: number;
  }[];
  triggerBreakdown: { name: string; count: number }[];
  workflowDuration: { workflowName: string; avgMinutes: number }[];
}

export function computeAnalytics(runs: WorkflowRun[]): AnalyticsSummary {
  if (!runs || runs.length === 0) {
    return {
      totalRuns: 0,
      successRate: 0,
      avgDurationFormatted: '0m 0s',
      durationTrend: [],
      statusBreakdown: [],
      triggerBreakdown: [],
      workflowDuration: [],
    };
  }

  const totalRuns = runs.length;
  const successfulRuns = runs.filter(
    (r) => r.status === 'success' || r.conclusion === 'success',
  );
  const successRate = Number(
    ((successfulRuns.length / totalRuns) * 100).toFixed(1),
  );

  // Calculate average duration
  const totalSeconds = runs.reduce(
    (acc, r) => acc + (r.durationInSeconds || 120),
    0,
  );
  const avgSeconds = Math.round(totalSeconds / totalRuns);
  const avgMins = Math.floor(avgSeconds / 60);
  const avgSecs = avgSeconds % 60;
  const avgDurationFormatted = `${avgMins}m ${avgSecs}s`;

  // Group by date for trends & status breakdown
  const dateMap: Record<
    string,
    { success: number; failure: number; totalSec: number; count: number }
  > = {};

  // Group by trigger / event
  const triggerMap: Record<string, number> = {};

  // Group by workflow name
  const workflowMap: Record<string, { totalSec: number; count: number }> = {};

  runs.forEach((run) => {
    // Date formatting (YYYY-MM-DD or short label)
    const dateKey = run.createdAt ? run.createdAt.split('T')[0] : 'Recent';
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { success: 0, failure: 0, totalSec: 0, count: 0 };
    }

    const isSuccess = run.status === 'success' || run.conclusion === 'success';
    if (isSuccess) {
      dateMap[dateKey].success += 1;
    } else {
      dateMap[dateKey].failure += 1;
    }
    dateMap[dateKey].totalSec += run.durationInSeconds || 120;
    dateMap[dateKey].count += 1;

    // Trigger breakdown
    const trigger = run.event || 'push';
    triggerMap[trigger] = (triggerMap[trigger] || 0) + 1;

    // Workflow breakdown
    const wfName = run.name || 'CI Workflow';
    if (!workflowMap[wfName]) {
      workflowMap[wfName] = { totalSec: 0, count: 0 };
    }
    workflowMap[wfName].totalSec += run.durationInSeconds || 120;
    workflowMap[wfName].count += 1;
  });

  const statusBreakdown = Object.entries(dateMap).map(([date, data]) => ({
    date,
    successCount: data.success,
    failureCount: data.failure,
  }));

  const durationTrend = Object.entries(dateMap).map(([date, data]) => ({
    date,
    avgDurationMinutes: Number((data.totalSec / data.count / 60).toFixed(1)),
  }));

  const triggerBreakdown = Object.entries(triggerMap).map(([name, count]) => ({
    name,
    count,
  }));

  const workflowDuration = Object.entries(workflowMap).map(
    ([workflowName, data]) => ({
      workflowName,
      avgMinutes: Number((data.totalSec / data.count / 60).toFixed(1)),
    }),
  );

  return {
    totalRuns,
    successRate,
    avgDurationFormatted,
    durationTrend,
    statusBreakdown,
    triggerBreakdown,
    workflowDuration,
  };
}
