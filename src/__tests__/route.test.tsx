import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/github/runs/route';
import { NextRequest } from 'next/server';

describe('GitHub Runs API Route Handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches workflow runs successfully and transforms them to domain models', async () => {
    const mockGitHubPayload = {
      workflow_runs: [
        {
          id: 501,
          display_title: 'CI Check',
          workflow_id: 'ci.yml',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'main',
          head_sha: '1234567890abcdef',
          head_commit: { message: 'test: add route handler integration test' },
          actor: {
            login: 'jamespa001',
            avatar_url: 'https://github.com/avatar.png',
          },
          created_at: '2026-10-14T12:00:00Z',
          updated_at: '2026-10-14T12:02:00Z',
          html_url: 'https://github.com/run/501',
        },
      ],
    };

    // Mock successful fetch response
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockGitHubPayload,
    } as Response);

    const req = new NextRequest(
      'http://localhost:3000/api/github/runs?owner=jamespa001&repo=project-e-commerce',
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.error).toBeNull();
    expect(json.isRateLimited).toBe(false);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].id).toBe(501);
    expect(json.data[0].status).toBe('success');
    expect(json.data[0].commitSha).toBe('1234567');
  });

  it('returns rate limit error state when GitHub returns 429 status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ message: 'API rate limit exceeded' }),
    } as Response);

    const req = new NextRequest(
      'http://localhost:3000/api/github/runs?owner=jamespa001&repo=project-e-commerce',
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.data).toBeNull();
    expect(json.isRateLimited).toBe(true);
    expect(json.error).toContain('rate limit exceeded');
  });

  it('falls back gracefully to mock dataset when network fetch fails completely', async () => {
    // Simulate network connectivity failure
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = new NextRequest(
      'http://localhost:3000/api/github/runs?owner=jamespa001&repo=project-e-commerce',
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.error).toBeNull();
    expect(json.isRateLimited).toBe(false);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].author.name).toBe('jamespa001');
    consoleSpy.mockRestore();
  });
});
