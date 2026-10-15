import { NextRequest, NextResponse } from 'next/server';

interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  owner: { login: string };
  default_branch: string;
}

interface GitHubRunItem {
  status: string;
  conclusion: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || 'jamespa001';
  const token = process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: 60 } },
    );

    if (!reposRes.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${reposRes.statusText}` },
        { status: reposRes.status },
      );
    }

    const repos: GitHubRepoItem[] = await reposRes.json();

    const repositories = await Promise.all(
      repos.map(async (repo) => {
        try {
          const runsRes = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/actions/runs?per_page=1`,
            { headers, next: { revalidate: 60 } },
          );

          if (!runsRes.ok) {
            return {
              id: String(repo.id),
              name: repo.name,
              fullName: repo.full_name,
              owner: repo.owner.login,
              defaultBranch: repo.default_branch || 'main',
              url: repo.html_url,
              latestStatus: 'no_runs' as const,
            };
          }

          const runsData = await runsRes.json();
          const latestRun: GitHubRunItem | undefined =
            runsData.workflow_runs?.[0];

          let status:
            | 'success'
            | 'failure'
            | 'in_progress'
            | 'queued'
            | 'no_runs' = 'no_runs';
          if (latestRun) {
            if (latestRun.status === 'in_progress') status = 'in_progress';
            else if (latestRun.status === 'queued') status = 'queued';
            else if (latestRun.conclusion === 'success') status = 'success';
            else if (latestRun.conclusion === 'failure') status = 'failure';
          }

          const durationSeconds = latestRun
            ? Math.max(
                0,
                Math.round(
                  (new Date(latestRun.updated_at).getTime() -
                    new Date(latestRun.created_at).getTime()) /
                    1000,
                ),
              )
            : 0;

          return {
            id: String(repo.id),
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner.login,
            defaultBranch: repo.default_branch || 'main',
            url: repo.html_url,
            latestStatus: status,
            workflowName: latestRun?.name || 'N/A',
            updatedAt: latestRun?.updated_at,
            runUrl: latestRun?.html_url,
            durationSeconds,
          };
        } catch {
          return {
            id: String(repo.id),
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner.login,
            defaultBranch: repo.default_branch || 'main',
            url: repo.html_url,
            latestStatus: 'no_runs' as const,
          };
        }
      }),
    );

    const totalRepos = repositories.length;
    const passed = repositories.filter(
      (r) => r.latestStatus === 'success',
    ).length;
    const failed = repositories.filter(
      (r) => r.latestStatus === 'failure',
    ).length;
    const needsAttention = repositories.filter(
      (r) => r.latestStatus === 'in_progress' || r.latestStatus === 'queued',
    ).length;
    const passRate =
      totalRepos > 0 ? Math.round((passed / totalRepos) * 100) : 0;

    const runsWithDuration = repositories.filter(
      (r) => r.durationSeconds && r.durationSeconds > 0,
    );
    const avgDurationSeconds =
      runsWithDuration.length > 0
        ? Math.round(
            runsWithDuration.reduce(
              (acc, r) => acc + (r.durationSeconds || 0),
              0,
            ) / runsWithDuration.length,
          )
        : 0;

    return NextResponse.json({
      totalRepos,
      passed,
      failed,
      needsAttention,
      passRate,
      avgDurationSeconds,
      repositories,
    });
  } catch (error) {
    console.error('Fleet Summary Error:', error);
    return NextResponse.json(
      { error: 'Failed to build fleet summary' },
      { status: 500 },
    );
  }
}
