import React from 'react';
import { RunStatus } from '@/types';
import { CheckCircle2, XCircle, Clock, Loader2, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: RunStatus;
  conclusion?: RunStatus; // Add optional conclusion prop
}

const statusConfig: Record<
  RunStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  success: {
    label: 'Success',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    text: 'text-emerald-300 font-semibold',
    icon: (
      <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
    ),
  },
  failure: {
    label: 'Failure',
    bg: 'bg-rose-500/15 border-rose-500/30',
    text: 'text-rose-300 font-semibold',
    icon: <XCircle className="w-4 h-4 text-rose-400" aria-hidden="true" />,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-500/15 border-amber-500/30',
    text: 'text-amber-300 font-semibold',
    icon: (
      <Loader2
        className="w-4 h-4 text-amber-400 animate-spin"
        aria-hidden="true"
      />
    ),
  },
  queued: {
    label: 'Queued',
    bg: 'bg-sky-500/15 border-sky-500/30',
    text: 'text-sky-300 font-semibold',
    icon: <Clock className="w-4 h-4 text-sky-400" aria-hidden="true" />,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-zinc-500/15 border-zinc-500/30',
    text: 'text-zinc-300 font-semibold',
    icon: <Ban className="w-4 h-4 text-zinc-400" aria-hidden="true" />,
  },
};

export function StatusBadge({ status, conclusion }: StatusBadgeProps) {
  // Use conclusion if status is 'completed' or fallback to status
  const effectiveStatus = conclusion || status;
  const config = statusConfig[effectiveStatus] || statusConfig.queued;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${config.bg} ${config.text}`}
      role="status"
      aria-live="polite"
      aria-label={`Workflow status: ${config.label}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
