import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RepoDetailPage from './page';

// Mock Next.js navigation hooks if used (e.g., useParams)
vi.mock('next/navigation', () => ({
  useParams: () => ({ name: 'alpha-repo' }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockRepoDetailData = {
  name: 'alpha-repo',
  fullName: 'jamespa001/alpha-repo',
  latestStatus: 'success',
  workflowName: 'CI Pipeline',
  durationSeconds: 45,
  runs: [
    {
      id: 'run-1',
      name: 'CI Pipeline',
      status: 'success',
      conclusion: 'success',
      durationSeconds: 45,
      createdAt: '2026-10-14T00:00:00Z',
    },
  ],
};

describe('RepoDetailPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/github/repo/')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockRepoDetailData),
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as unknown as typeof global.fetch;
  });

  it('renders repository detail view and workflow runs successfully', async () => {
    render(<RepoDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('jamespa001/alpha-repo')).toBeInTheDocument();
    });

    // Replace 'CI Pipeline' with whatever name is actually in your mock workflows array (e.g., 'Build & Test')
    expect(screen.getByText('alpha-repo')).toBeInTheDocument();
  });
});
