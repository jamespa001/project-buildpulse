import { describe, it, expect } from 'vitest';
import { mapGitHubRunToDomain } from '../lib/mappers';

describe('mapGitHubRunToDomain', () => {
  it('correctly maps a successful GitHub run payload to domain model', () => {
    const mockRawRun = {
      id: 101,
      name: 'CI Workflow',
      status: 'completed',
      conclusion: 'success',
      head_branch: 'main',
      head_sha: 'a1b2c3d4e5f6',
      head_commit: { message: 'Fix typo in README' },
      actor: {
        login: 'jamespark',
        avatar_url: 'https://github.com/avatar.png',
      },
      created_at: '2026-10-14T10:00:00Z',
      updated_at: '2026-10-14T10:02:30Z',
      html_url: 'https://github.com/run/101',
    };

    const result = mapGitHubRunToDomain(mockRawRun);

    expect(result.id).toBe(101);
    expect(result.status).toBe('success');
    expect(result.commitSha).toBe('a1b2c3d');
    expect(result.durationInSeconds).toBe(150); // 2 minutes 30 seconds
    expect(result.author.name).toBe('jamespark');
  });

  it('handles in_progress runs without a completed updated_at date', () => {
    const mockRawRun = {
      id: 102,
      status: 'in_progress',
      created_at: new Date(Date.now() - 30000).toISOString(), // 30s ago
    };

    const result = mapGitHubRunToDomain(mockRawRun);

    expect(result.status).toBe('in_progress');
    expect(result.durationInSeconds).toBeGreaterThanOrEqual(30);
  });
});
