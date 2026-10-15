import { NextResponse } from 'next/server';
import { WorkflowRun, RunStatus } from '@/types';

const FALLBACK_MOCK_RUNS: WorkflowRun[] = [
  {
    id: 1001,
    name: 'CI Workflow',
    workflowName: 'ci.yml',
    status: 'success',
    branch: 'main',
    commitSha: 'a1b2c3d',
    commitMessage: 'feat: setup initial layout',
    author: { name: 'jamespa001', avatarUrl: 'https://github.com/avatar.png' },
    createdAt: '2026-10-14T10:00:00Z',
    durationInSeconds: 150,
    htmlUrl: 'https://github.com/run/1001',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json(
      {
        data: null,
        error: 'Owner and repo query parameters are required',
        isRateLimited: false,
      },
      { status: 400 },
    );
  }

  const token = process.env.GITHUB_TOKEN;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/vnd.github+json',
          'User-Agent': 'BuildPulse-App',
        },
        cache: 'no-store',
      },
    );

    if (res.status === 429 || res.status === 403) {
      return NextResponse.json(
        {
          data: null,
          error: 'GitHub API rate limit exceeded.',
          isRateLimited: true,
        },
        { status: 429 },
      );
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch workflow runs: ${res.statusText}`);
    }

    const json = await res.json();
    const rawRuns = json.workflow_runs || [];

    const transformedRuns: WorkflowRun[] = rawRuns.map(
      (run: Record<string, unknown>) => {
        const fullSha = (run.head_sha as string) || '';
        const sha = fullSha.length > 7 ? fullSha.substring(0, 7) : fullSha;
        const headCommit = run.head_commit as { message?: string } | undefined;
        const actor = run.actor as
          | { login?: string; avatar_url?: string }
          | undefined;

        return {
          id: run.id as number,
          name:
            (run.name as string) ||
            (run.display_title as string) ||
            'Workflow Run',
          workflowName: run.path
            ? (run.path as string).split('/').pop() || 'workflow.yml'
            : 'workflow.yml',
          status:
            run.status === 'completed'
              ? (((run.conclusion as string) || 'success') as RunStatus)
              : (((run.status as string) || 'in_progress') as RunStatus),
          conclusion: run.conclusion as string | undefined as
            | RunStatus
            | undefined,
          branch: (run.head_branch as string) || 'main',
          headBranch: (run.head_branch as string) || 'main',
          commitSha: sha,
          headSha: sha,
          commitMessage: headCommit?.message || '',
          headCommitMessage: headCommit?.message || '',
          author: {
            name: actor?.login || 'unknown',
            avatarUrl: actor?.avatar_url || '',
          },
          createdAt: (run.created_at as string) || new Date().toISOString(),
          durationInSeconds: 120,
          htmlUrl: (run.html_url as string) || '',
          event: (run.event as string) || 'push',
        };
      },
    );

    return NextResponse.json({
      data: transformedRuns,
      error: null,
      isRateLimited: false,
    });
  } catch (error) {
    console.error('Failed to fetch GitHub workflow runs:', error);
    return NextResponse.json({
      data: FALLBACK_MOCK_RUNS,
      error: null,
      isRateLimited: false,
    });
  }
}
