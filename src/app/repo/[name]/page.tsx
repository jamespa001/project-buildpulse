'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkflowRun, RepositoryOption } from '@/types';
import { RunsTable } from '@/components/RunsTable';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { BackToTop } from '@/components/BackToTop';

export default function RepoDetailPage() {
  const params = useParams();
  const repoName = params?.name as string;

  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentRepo: RepositoryOption = {
    name: repoName,
    fullName: `jamespa001/${repoName}`,
    url: `https://github.com/jamespa001/${repoName}`,
    isPrivate: false,
    owner: 'jamespa001',
    defaultBranch: 'main',
  };

  const fetchRuns = useCallback(async () => {
    if (!repoName) return;
    setIsLoading(true);

    try {
      const endpoint = `/api/github/runs?owner=jamespa001&repo=${encodeURIComponent(repoName)}`;
      const response = await fetch(endpoint);
      const json = await response.json();

      if (json.error && !json.data) {
        setRuns([]);
      } else {
        setRuns(json.data || []);
      }
    } catch {
      setRuns([]);
    } finally {
      setIsLoading(false);
    }
  }, [repoName]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to Fleet Summary"
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Back to Fleet Summary"
            >
              <ArrowLeft aria-hidden="true" className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-400">
                  Fleet Summary
                </span>
                <span aria-hidden="true" className="text-xs text-slate-600">
                  /
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {currentRepo.fullName}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                {currentRepo.name}
              </h1>
            </div>
          </div>

          <button
            onClick={fetchRuns}
            disabled={isLoading}
            aria-label="Refresh repository runs"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh Runs</span>
          </button>
        </header>

        <div className="animate-fade-in-up opacity-0">
          {/* Analytics Section */}
          <AnalyticsDashboard runs={runs} selectedRepo={currentRepo} />

          {/* Recent Runs Table */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Workflow Executions
            </h2>
            <RunsTable runs={runs} isLoading={isLoading} />
          </section>
        </div>
      </div>

      <BackToTop />
    </main>
  );
}
