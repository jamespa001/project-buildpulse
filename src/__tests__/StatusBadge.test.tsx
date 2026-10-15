import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders success status correctly', () => {
    render(<StatusBadge status="success" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Success');
  });

  it('renders failure status correctly', () => {
    render(<StatusBadge status="failure" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Failure');
  });

  it('renders in_progress status with loading indicators', () => {
    render(<StatusBadge status="in_progress" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('In Progress');
  });
});
