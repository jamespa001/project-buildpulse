import React from 'react';
import { WorkflowRun } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ExternalLink, GitCommit, Clock, PlayCircle, User } from 'lucide-react';

interface RunsTableProps {
  runs: WorkflowRun[];
  isLoading?: boolean;
}

export function RunsTable({ runs, isLoading = false }: RunsTableProps) {
  if (isLoading) {
    return (
      <div
        data-testid="table-loading"
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center py-12 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-400 font-medium"
      >
        <div
          className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"
          aria-hidden="true"
        />
        <span>Loading workflow runs...</span>
      </div>
    );
  }

  if (!runs || runs.length === 0) {
    return (
      <div
        data-testid="table-empty"
        className="flex flex-col items-center justify-center py-12 px-4 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center"
      >
        <PlayCircle
          className="w-8 h-8 text-slate-500 mb-2"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-300">
          No workflow runs found for this repository.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Make sure GitHub Actions are configured and have run at least once.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-md">
      <table
        className="w-full text-left border-collapse"
        aria-label="Workflow Runs Table"
      >
        <thead>
          <tr className="bg-slate-900/90 border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th scope="col" className="py-3 px-4">
              Status
            </th>
            <th scope="col" className="py-3 px-4">
              Workflow / Event
            </th>
            <th scope="col" className="py-3 px-4">
              Commit
            </th>
            <th scope="col" className="py-3 px-4">
              Branch
            </th>
            <th scope="col" className="py-3 px-4">
              Duration
            </th>
            <th scope="col" className="py-3 px-4 text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200 font-medium">
          {runs.map((run) => {
            const sha = run.commitSha || run.headSha || '---';
            const displaySha = sha.length > 7 ? sha.substring(0, 7) : sha;

            let durationText = run.duration || 'N/A';
            if (!run.duration && typeof run.durationInSeconds === 'number') {
              const mins = Math.floor(run.durationInSeconds / 60);
              const secs = run.durationInSeconds % 60;
              durationText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
            }

            const authorName =
              typeof run.author === 'string' ? run.author : run.author?.name;

            return (
              <tr
                key={run.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge
                    status={run.status}
                    conclusion={run.conclusion}
                  />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {run.name}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {run.event || 'push'} trigger
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <GitCommit
                        className="w-3.5 h-3.5 text-slate-500"
                        aria-hidden="true"
                      />
                      <span>{displaySha}</span>
                    </div>
                    {(run.commitMessage || run.headCommitMessage) && (
                      <span className="text-slate-300 text-xs truncate max-w-xs font-sans">
                        {run.commitMessage || run.headCommitMessage}
                      </span>
                    )}
                    {authorName && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-sans mt-0.5">
                        <User
                          className="w-3 h-3 text-slate-500"
                          aria-hidden="true"
                        />
                        <span>{authorName}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                  {run.branch || run.headBranch || 'main'}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock
                      className="w-3.5 h-3.5 text-slate-500"
                      aria-hidden="true"
                    />
                    <span>{durationText}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  {run.htmlUrl ? (
                    <a
                      href={run.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View workflow run ${run.name} on GitHub`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 py-0.5"
                    >
                      View Run
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
