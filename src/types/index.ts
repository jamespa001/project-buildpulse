export type RunStatus =
  | 'success'
  | 'failure'
  | 'in_progress'
  | 'queued'
  | 'cancelled';

export interface WorkflowRun {
  id: number;
  name: string;
  workflowName: string;
  status: RunStatus;
  conclusion?: RunStatus;
  branch: string;
  headBranch?: string;
  commitSha: string;
  headSha?: string;
  commitMessage?: string;
  headCommitMessage?: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  duration?: string;
  durationInSeconds?: number;
  htmlUrl?: string;
  event?: string;
}

export interface RepositoryOption {
  owner: string;
  name: string;
  fullName: string;
  url?: string;
  isPrivate?: boolean;
  defaultBranch?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isRateLimited: boolean;
}

export interface RepoSummaryStatus {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  url: string;
  latestStatus: 'success' | 'failure' | 'in_progress' | 'queued' | 'no_runs';
  workflowName?: string;
  updatedAt?: string;
  runUrl?: string;
  durationSeconds?: number;
}

export interface FleetSummaryData {
  totalRepos: number;
  passed: number;
  failed: number;
  needsAttention: number;
  passRate: number;
  avgDurationSeconds: number;
  repositories: RepoSummaryStatus[];
  error?: string | null;
}
