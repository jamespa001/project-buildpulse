import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Pin,
} from 'lucide-react';
import { RepoSummaryStatus } from '@/types';

interface RepoCardProps {
  repo: RepoSummaryStatus;
  index: number;
  isPinned: boolean;
  onTogglePin: (fullName: string, e: React.MouseEvent) => void;
  formatDuration: (seconds?: number) => string;
}

export function RepoCard({
  repo,
  index,
  isPinned,
  onTogglePin,
  formatDuration,
}: RepoCardProps) {
  return (
    <div
      className="animate-fade-in-up opacity-0 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group relative"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                {repo.name}
              </h3>
              {/* Pin Toggle Button */}
              <button
                onClick={(e) => onTogglePin(repo.fullName, e)}
                aria-label={
                  isPinned ? `Unpin ${repo.name}` : `Pin ${repo.name}`
                }
                aria-pressed={isPinned}
                title={isPinned ? 'Unpin repository' : 'Pin repository'}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isPinned
                    ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Pin
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 ${isPinned ? 'fill-indigo-400' : ''}`}
                />
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {repo.fullName}
            </p>
          </div>

          {/* Status Badge */}
          {repo.latestStatus === 'success' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 aria-hidden="true" className="w-3 h-3" /> Passing
            </span>
          )}
          {repo.latestStatus === 'failure' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle aria-hidden="true" className="w-3 h-3" /> Failing
            </span>
          )}
          {(repo.latestStatus === 'in_progress' ||
            repo.latestStatus === 'queued') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle
                aria-hidden="true"
                className="w-3 h-3 animate-pulse"
              />{' '}
              Running
            </span>
          )}
          {repo.latestStatus === 'no_runs' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">
              No Runs
            </span>
          )}
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <p>
            Workflow:{' '}
            <span className="text-slate-200">{repo.workflowName || 'N/A'}</span>
          </p>
          <p>
            Duration:{' '}
            <span className="text-slate-200">
              {formatDuration(repo.durationSeconds)}
            </span>
          </p>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${repo.name} on GitHub (opens in a new tab)`}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          GitHub <ExternalLink aria-hidden="true" className="w-3 h-3" />
        </a>

        <Link
          href={`/repo/${repo.name}`}
          aria-label={`Drill down into telemetry for ${repo.name}`}
          className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Drill Down <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
