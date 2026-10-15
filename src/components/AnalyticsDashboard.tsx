import React, { useMemo } from 'react';
import { WorkflowRun, RepositoryOption } from '@/types';
import { computeAnalytics } from '@/utils/analytics';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CheckCircle2, Clock, Activity, GitCommit } from 'lucide-react';

interface AnalyticsDashboardProps {
  runs: WorkflowRun[];
  selectedRepo?: RepositoryOption;
}

export function AnalyticsDashboard({ runs }: AnalyticsDashboardProps) {
  // Memoize analytics calculations to prevent unnecessary re-computations
  const analytics = useMemo(() => computeAnalytics(runs), [runs]);

  return (
    <div
      className="flex flex-col gap-6 w-full mb-6"
      role="region"
      aria-label="Performance Analytics Overview"
    >
      {/* 1. Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Success Rate
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              {analytics.successRate}%
            </h3>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Stable
              across recent runs
            </span>
          </div>
          <div
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400"
            aria-hidden="true"
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Avg Build Duration
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              {analytics.avgDurationFormatted}
            </h3>
            <span className="text-xs text-indigo-400 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Optimized
              caching active
            </span>
          </div>
          <div
            className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400"
            aria-hidden="true"
          >
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Runs
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              {analytics.totalRuns}
            </h3>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
              <Activity
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />{' '}
              Tracked workflow executions
            </span>
          </div>
          <div
            className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400"
            aria-hidden="true"
          >
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Active Triggers
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              {analytics.triggerBreakdown.length} Types
            </h3>
            <span className="text-xs text-purple-400 font-medium flex items-center gap-1 mt-1">
              <GitCommit className="w-3.5 h-3.5" aria-hidden="true" /> Push & PR
              webhook hooks
            </span>
          </div>
          <div
            className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400"
            aria-hidden="true"
          >
            <GitCommit className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2 & 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          role="region"
          aria-label="Build Pass / Fail Trend Chart"
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Build Pass / Fail Trend
            </h4>
            <span className="text-xs text-slate-400">Daily Volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.statusBreakdown}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.4}
                />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="successCount"
                  name="Successful Runs"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="failureCount"
                  name="Failed Runs"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          role="region"
          aria-label="Average Duration by Workflow Chart"
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">
              Avg Duration by Workflow (mins)
            </h4>
            <span className="text-xs text-slate-400">Execution Speed</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.workflowDuration}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.4}
                />
                <XAxis dataKey="workflowName" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar
                  dataKey="avgMinutes"
                  name="Avg Duration (min)"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
