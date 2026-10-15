import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SummaryLandingPage from '../app/page';

// Mock fetch globally
const mockSummaryData = {
  totalRepos: 3,
  passed: 2,
  failed: 1,
  needsAttention: 0,
  passRate: 67,
  avgDurationSeconds: 45,
  repositories: [
    {
      id: '1',
      name: 'alpha-repo',
      fullName: 'jamespa001/alpha-repo',
      latestStatus: 'success',
      workflowName: 'CI Pipeline',
      durationSeconds: 30,
      updatedAt: '2026-10-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'beta-repo',
      fullName: 'jamespa001/beta-repo',
      latestStatus: 'failure',
      workflowName: 'Test Suite',
      durationSeconds: 60,
      updatedAt: '2026-10-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'gamma-repo',
      fullName: 'jamespa001/gamma-repo',
      latestStatus: 'success',
      workflowName: 'Build',
      durationSeconds: 45,
      updatedAt: '2026-10-03T00:00:00Z',
    },
  ],
};

const mockPinnedData = {
  repos: [
    {
      id: 'R_kgDOV1',
      name: 'alpha-repo',
      fullName: 'jamespa001/alpha-repo',
    },
  ],
};

describe('SummaryLandingPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/github/summary')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockSummaryData),
        } as Response);
      }
      if (
        String(url).includes(
          '/api/github/repos?username=jamespa001&type=pinned',
        )
      ) {
        return Promise.resolve({
          json: () => Promise.resolve(mockPinnedData),
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as unknown as typeof global.fetch;
  });

  it('renders summary dashboard and loads repositories correctly', async () => {
    render(<SummaryLandingPage />);

    // Check loading state initially or wait for metrics
    await waitFor(() => {
      expect(screen.getByText('BuildPulse Fleet Summary')).toBeInTheDocument();
    });

    // Verify KPI banner global metrics
    expect(screen.getAllByText('3')[0]).toBeInTheDocument(); // total repos count from summaryJson in main app
    expect(screen.getByText('alpha-repo')).toBeInTheDocument();
    expect(screen.getByText('beta-repo')).toBeInTheDocument();
  });

  it('filters repositories when clicking status tabs (e.g. Pinned or Passing)', async () => {
    render(<SummaryLandingPage />);

    await waitFor(() => {
      expect(screen.getByText('alpha-repo')).toBeInTheDocument();
    });

    // Click on Pinned tab
    const pinnedTab = screen.getByRole('tab', { name: /pinned/i });
    fireEvent.click(pinnedTab);

    // Alpha repo should be visible (it's pinned), beta should not
    expect(screen.getByText('alpha-repo')).toBeInTheDocument();
    expect(screen.queryByText('beta-repo')).not.toBeInTheDocument();
  });

  it('filters repositories using the search bar', async () => {
    render(<SummaryLandingPage />);

    await waitFor(() => {
      expect(screen.getByText('alpha-repo')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search repos...');
    fireEvent.change(searchInput, { target: { value: 'beta' } });

    expect(screen.queryByText('alpha-repo')).not.toBeInTheDocument();
    expect(screen.getByText('beta-repo')).toBeInTheDocument();
  });

  it('handles pagination controls and page size adjustments', async () => {
    render(<SummaryLandingPage />);

    await waitFor(() => {
      expect(screen.getByText('alpha-repo')).toBeInTheDocument();
    });

    // Check page size dropdown exists
    const pageSizeSelect = screen.getByLabelText('Repositories per page');
    expect(pageSizeSelect).toBeInTheDocument();

    // Change page size
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });
    expect(pageSizeSelect).toHaveValue('20');
  });
});
