import { WorkflowRun, RunStatus } from '@/types';

// Define the shape of the raw GitHub API run object
export interface RawGitHubRun {
  id: number;
  name?: string;
  display_title?: string;
  workflow_id?: number | string;
  status?: string;
  conclusion?: string;
  head_branch?: string;
  head_sha?: string;
  head_commit?: {
    message?: string;
  };
  actor?: {
    login?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at?: string;
  html_url?: string;
}

export function mapGitHubRunToDomain(rawRun: RawGitHubRun): WorkflowRun {
  const start = new Date(rawRun.created_at).getTime();
  const end = rawRun.updated_at
    ? new Date(rawRun.updated_at).getTime()
    : Date.now();
  const durationInSeconds = Math.max(0, Math.floor((end - start) / 1000));

  let status: RunStatus = 'queued';
  if (rawRun.status === 'in_progress') {
    status = 'in_progress';
  } else if (rawRun.conclusion === 'success') {
    status = 'success';
  } else if (rawRun.conclusion === 'failure') {
    status = 'failure';
  } else if (rawRun.conclusion === 'cancelled') {
    status = 'cancelled';
  }

  return {
    id: rawRun.id,
    name: rawRun.display_title || rawRun.name || 'Workflow Run',
    workflowName: rawRun.workflow_id?.toString() || 'Workflow',
    status,
    branch: rawRun.head_branch || 'main',
    commitSha: rawRun.head_sha ? rawRun.head_sha.substring(0, 7) : '0000000',
    commitMessage: rawRun.head_commit?.message || 'No commit message',
    author: {
      name: rawRun.actor?.login || 'unknown',
      avatarUrl: rawRun.actor?.avatar_url || '',
    },
    createdAt: rawRun.created_at,
    durationInSeconds,
    htmlUrl: rawRun.html_url || '#',
  };
}
