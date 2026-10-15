import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RunsTable } from '@/components/RunsTable';
import { WorkflowRun } from '@/types';

const mockRuns: WorkflowRun[] = [
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

describe('RunsTable Component', () => {
  it('renders workflow run items correctly', () => {
    render(<RunsTable runs={mockRuns} />);

    expect(screen.getByText('CI Workflow')).toBeInTheDocument();
    expect(screen.getByText('feat: setup initial layout')).toBeInTheDocument();
    expect(screen.getByText('a1b2c3d')).toBeInTheDocument();
    expect(screen.getByText('jamespa001')).toBeInTheDocument();
    expect(screen.getByText('2m 30s')).toBeInTheDocument();
  });

  it('renders empty message when no runs are provided', () => {
    render(<RunsTable runs={[]} />);

    expect(
      screen.getByText('No workflow runs found for this repository.'),
    ).toBeInTheDocument();
  });

  it('renders skeleton loading state when isLoading is true', () => {
    render(<RunsTable runs={[]} isLoading={true} />);

    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
  });
});
