import { clsx } from 'clsx';
import type { IssueStatus } from '@/types';

const STATUS_STYLES: Record<IssueStatus, string> = {
  new:         'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved:    'bg-emerald-50 text-emerald-700',
  dismissed:   'bg-slate-100 text-slate-500',
};

const STATUS_LABELS: Record<IssueStatus, string> = {
  new:         'New',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  dismissed:   'Dismissed',
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', className)}>
      {label}
    </span>
  );
}
